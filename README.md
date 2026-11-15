# Kings Castle — Sacramento Kings Royalty

A GitHub-ready static fan website starter.

## Included
- Homepage with the latest three YouTube videos
- Full video library
- Individual embedded YouTube video pages
- Kings News starter page and article template
- The Kingdom, The Vault, and Game Day sections
- Responsive layout for desktop and mobile

## Your three videos
The YouTube IDs you supplied are already entered in `assets/js/content.js`:
- `RzSytBizAuo`
- `5FwQSBp69Bc`
- `5wLbnwzNjwg`

The current titles are placeholders. Replace each `title` with the real video title. Add future uploads to the top of the array. The homepage automatically displays the three most recent entries based on their `date` field.

## Preview locally
Open `index.html` in a browser. For a more reliable local preview, use VS Code with the Live Server extension.

## Publish with GitHub Pages
1. Create a new GitHub repository.
2. Upload the contents of this folder (not the ZIP itself).
3. Open repository **Settings → Pages**.
4. Under Build and deployment, choose **Deploy from a branch**.
5. Select `main` and `/ (root)`, then Save.
6. GitHub will provide your website address.

## Editing videos
Edit `assets/js/content.js`. Each entry looks like:
```js
{ id: "YOUTUBE_VIDEO_ID", title: "Video title", category: "GAME RECAP", date: "2026-11-15" }
```

## Brand and affiliation
Kings Castle is an independent, unofficial fan publication and is not affiliated with or endorsed by the NBA or Sacramento Kings. Use original writing and properly licensed or attributed images and media.
