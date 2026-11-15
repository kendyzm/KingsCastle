# Kings Castle — Game Day automation

This package updates the existing Kings Castle `game-day.html` page using a scheduled GitHub Actions workflow.

## Files
- `game-day.html` — updated page based on the uploaded file
- `assets/js/game-day.js` — renders the record, latest result, next game, and game table
- `data/games.json` — data file populated by the updater
- `scripts/update_nba_scores.py` — retrieves Sacramento Kings schedule/results from ESPN's public schedule endpoint
- `.github/workflows/update-kings-game-day.yml` — runs the updater every 30 minutes and commits changes

## Install into your existing website repository

1. Unzip this package.
2. Copy `game-day.html` into the root of your existing website, replacing the old file.
3. Copy the `assets/js/game-day.js` file into the matching `assets/js/` folder.
4. Copy `data/games.json` into a new `data/` folder in the website root.
5. Copy `scripts/update_nba_scores.py` into a `scripts/` folder.
6. Copy `.github/workflows/update-kings-game-day.yml` into the matching `.github/workflows/` folder.
7. Keep your existing `assets/css/style.css` and `assets/js/main.js`; this update uses them.
8. Commit and push all files to GitHub.

## Enable GitHub Actions

In your GitHub repository:
1. Open **Settings → Actions → General**.
2. Under Workflow permissions, select **Read and write permissions** and save.
3. Open the **Actions** tab and select **Update Kings Game Day**.
4. Choose **Run workflow** once to populate `data/games.json`.

The workflow then runs twice an hour. GitHub scheduled workflows can be delayed during busy periods; this is not a second-by-second live scoreboard.

## Notes
- The script calculates the season record from completed regular-season games.
- It includes scheduled/live games and final scores when ESPN provides them.
- The data source is ESPN's public, undocumented schedule endpoint; ESPN can change it without notice.
- The page requires the JSON file to be hosted at `data/games.json` on the same site.
- If your repository uses a different default branch or deployment setup, the workflow still commits to the checked-out branch, but your Pages deployment must publish that branch/folder.
- The placeholder `games.json` is intentionally empty until the first workflow run succeeds.
