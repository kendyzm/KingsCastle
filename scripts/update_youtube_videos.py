#!/usr/bin/env python3
"""Collect recent Sacramento Kings YouTube videos using the YouTube Data API v3."""
import json
import os
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

API_KEY = os.environ.get("YOUTUBE_API_KEY")
if not API_KEY:
    raise SystemExit("Missing YOUTUBE_API_KEY environment variable.")

SEARCHES = [
    ("Sacramento Kings", "Kings"),
    ("Sacramento Kings highlights", "Highlights"),
    ("Sacramento Kings news", "News"),
    ("Sacramento Kings reaction", "Fan Reactions"),
    ("Sacramento Kings press conference interview", "Interviews"),
    ("Sacramento Kings podcast analysis", "Analysis & Podcasts"),
]
MANUAL_VIDEO_IDS = ["RzSytBizAuo", "5FwQSBp69Bc", "5wLbnwzNjwg"]
MAX_AGE_DAYS = int(os.environ.get("VIDEO_LOOKBACK_DAYS", "30"))
MAX_VIDEOS = int(os.environ.get("MAX_KINGS_VIDEOS", "100"))
OUTFILE = "data/videos.json"

def api_get(endpoint, params):
    params = dict(params)
    params["key"] = API_KEY
    url = "https://www.googleapis.com/youtube/v3/" + endpoint + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": "KingsCastleVideoCollector/1.0"})
    with urllib.request.urlopen(req, timeout=30) as response:
        return json.load(response)

def clean_video(item, category=None):
    snippet = item.get("snippet", {})
    video_id = item.get("id")
    if isinstance(video_id, dict):
        video_id = video_id.get("videoId")
    if not video_id:
        return None
    thumbs = snippet.get("thumbnails", {})
    thumb = (thumbs.get("high") or thumbs.get("medium") or thumbs.get("default") or {}).get("url")
    published = snippet.get("publishedAt")
    return {
        "id": video_id,
        "title": snippet.get("title", "Sacramento Kings video"),
        "description": snippet.get("description", ""),
        "channelTitle": snippet.get("channelTitle", "YouTube creator"),
        "publishedAt": published,
        "thumbnail": thumb or f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg",
        "category": category or "Kings Coverage",
        "url": f"https://www.youtube.com/watch?v={video_id}",
        "embedUrl": f"https://www.youtube-nocookie.com/embed/{video_id}",
        "source": "YouTube",
    }

def main():
    cutoff = (datetime.now(timezone.utc) - timedelta(days=MAX_AGE_DAYS)).isoformat(timespec="seconds").replace("+00:00", "Z")
    found = {}

    for query, category in SEARCHES:
        payload = api_get("search", {
            "part": "snippet",
            "q": query,
            "type": "video",
            "order": "date",
            "maxResults": 25,
            "publishedAfter": cutoff,
            "relevanceLanguage": "en",
            "regionCode": "US",
            "safeSearch": "moderate",
        })
        for item in payload.get("items", []):
            video = clean_video(item, category)
            if video:
                previous = found.get(video["id"])
                if not previous or previous.get("category") == "Kings Coverage":
                    found[video["id"]] = video

    # Keep the three existing Kings Castle videos in the feed, retrieving their real titles/channels.
    if MANUAL_VIDEO_IDS:
        details = api_get("videos", {
            "part": "snippet",
            "id": ",".join(MANUAL_VIDEO_IDS),
            "maxResults": 50,
        })
        for item in details.get("items", []):
            video = clean_video(item, "Kings Castle Picks")
            if video:
                found[video["id"]] = video

    videos = list(found.values())
    videos.sort(key=lambda v: v.get("publishedAt") or "", reverse=True)
    videos = videos[:MAX_VIDEOS]

    os.makedirs("data", exist_ok=True)
    result = {
        "title": "Sacramento Kings YouTube Videos",
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "source": "YouTube Data API v3",
        "searches": [q for q, _ in SEARCHES],
        "count": len(videos),
        "videos": videos,
    }
    with open(OUTFILE, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"Saved {len(videos)} videos to {OUTFILE}")

if __name__ == "__main__":
    main()
