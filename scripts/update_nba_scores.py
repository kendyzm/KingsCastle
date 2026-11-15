#!/usr/bin/env python3
"""Fetch the Sacramento Kings schedule/results from ESPN and write data/games.json."""
import json
import os
import urllib.request
from datetime import datetime, timezone

TEAM_ABBR = "SAC"
TEAM_SLUG = "sac"
SEASON = int(os.environ.get("NBA_SEASON") or (datetime.now().year + 1 if datetime.now().month >= 7 else datetime.now().year))
SEASON_TYPE = os.environ.get("NBA_SEASON_TYPE", "2")  # 2 = regular season
URL = (
    f"https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/"
    f"{TEAM_SLUG}/schedule?season={SEASON}&seasontype={SEASON_TYPE}"
)

def parse_game(event):
    comp = (event.get("competitions") or [{}])[0]
    competitors = comp.get("competitors") or []
    kings = next((c for c in competitors if (c.get("team") or {}).get("abbreviation") == TEAM_ABBR), None)
    if not kings:
        return None
    opponent = next((c for c in competitors if c is not kings), None)
    if not opponent:
        return None

    status_obj = (event.get("status") or {}).get("type") or {}
    state = (status_obj.get("state") or "").lower()
    completed = bool(status_obj.get("completed")) or state == "post"
    live = state == "in"
    kscore = kings.get("score")
    oscore = opponent.get("score")
    try:
        kscore = int(kscore) if kscore not in (None, "") else None
    except (TypeError, ValueError):
        kscore = None
    try:
        oscore = int(oscore) if oscore not in (None, "") else None
    except (TypeError, ValueError):
        oscore = None

    home_away = kings.get("homeAway", "").lower()
    is_home = home_away == "home"
    result = None
    if completed and kscore is not None and oscore is not None:
        result = "W" if kscore > oscore else "L" if kscore < oscore else "T"

    venue = (comp.get("venue") or {}).get("fullName")
    city = (comp.get("venue") or {}).get("address") or {}
    if isinstance(city, dict) and city.get("city"):
        venue = f"{venue} · {city['city']}"
    if not venue and is_home:
        venue = "Golden 1 Center · Sacramento"

    return {
        "id": event.get("id"),
        "date": event.get("date"),
        "time": event.get("date"),
        "opponent": (opponent.get("team") or {}).get("displayName") or (opponent.get("team") or {}).get("name") or "Opponent",
        "opponentAbbr": (opponent.get("team") or {}).get("abbreviation") or "OPP",
        "isHome": is_home,
        "venue": venue,
        "status": "final" if completed else "live" if live else "scheduled",
        "statusLabel": status_obj.get("shortDetail") or status_obj.get("description") or ("Live" if live else "Scheduled"),
        "kingsScore": kscore,
        "opponentScore": oscore,
        "result": result,
    }

def main():
    request = urllib.request.Request(URL, headers={"User-Agent": "KingsCastleFanSite/1.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        payload = json.load(response)

    events = payload.get("events") or []
    games = [g for event in events if (g := parse_game(event))]
    games.sort(key=lambda g: g.get("date") or "")
    if not games:
        raise RuntimeError("ESPN returned no Kings games; refusing to overwrite the existing schedule.")

    season_label = f"{SEASON - 1}–{str(SEASON)[-2:]} REGULAR SEASON"
    result = {
        "team": "Sacramento Kings",
        "season": SEASON,
        "seasonType": SEASON_TYPE,
        "seasonLabel": season_label,
        "source": "ESPN public scoreboard/schedule API",
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "games": games,
    }
    os.makedirs("data", exist_ok=True)
    with open("data/games.json", "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"Wrote {len(games)} Kings games to data/games.json")

if __name__ == "__main__":
    main()
