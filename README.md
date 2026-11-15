# Kings Castle — Full Website + Automated Game Day

This is the **complete Kings Castle website**, including all existing pages and the Game Day automation.

## Website pages
- `index.html` — homepage
- `news.html` — Kings news links and editorial listings
- `videos.html` — video library
- `video.html` — individual YouTube video page
- `article.html` — article template
- `kingdom.html` — fan culture / Sacramento
- `vault.html` — Kings history
- `game-day.html` — automatically updated schedule and results

## Assets and automation
- `assets/css/style.css` — site styling
- `assets/js/content.js` — homepage/video/news content
- `assets/js/main.js` — site interactions
- `assets/js/game-day.js` — renders Game Day data
- `data/games.json` — initial data plus auto-refreshed schedule
- `scripts/update_nba_scores.py` — fetches Kings schedule and scores from ESPN
- `.github/workflows/update-kings-game-day.yml` — scheduled GitHub Actions updater

## Publish the complete website
1. Download and unzip this package.
2. Open your existing GitHub repository.
3. Upload **all files and folders inside this package** to the repository root.
4. Allow folder merges and replace existing files when GitHub asks.
5. Commit the changes to your default branch.
6. Confirm GitHub Pages is publishing from the branch and folder containing `index.html`.

Do not upload the ZIP file itself into the repository. Upload its extracted contents.

## Enable automatic Game Day updates
1. In GitHub, open **Settings → Actions → General**.
2. Under **Workflow permissions**, select **Read and write permissions** and save.
3. Open the **Actions** tab.
4. Select **Update Kings Game Day**.
5. Click **Run workflow** once.

After the first successful run, the workflow is scheduled to run every 30 minutes. GitHub may delay scheduled workflows during periods of high load. Scores are not guaranteed to update second-by-second during live games.

## Existing content
Your three supplied YouTube video IDs and existing site content remain in `assets/js/content.js`. Update video titles, descriptions, dates, and news links there.

## Data source and limitations
The updater uses ESPN's public, undocumented schedule endpoint. ESPN may change this endpoint without notice. If the endpoint changes, the updater may need maintenance. The website itself is static and reads `data/games.json`; it does not need a separate server.

## Important
Kings Castle is an independent, unofficial fan publication and is not affiliated with or endorsed by the NBA or Sacramento Kings.
