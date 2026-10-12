# Hacktoberfest Team Shuffler

A neon, cyberpunk-styled single-page app for forming hackathon teams live on a projector.

1. **Lobby** – polls a published Google Sheet every 5 seconds; new registrations pop onto the screen with a sound.
2. **Shuffle** – names scramble and swirl into a vortex while a countdown and ticking build suspense.
3. **Reveal** – team cards with generated names cascade in, with skill-level and primary-skill badges.

Built with React, Vite, Tailwind CSS v4 and Framer Motion. Sound effects are synthesized in the browser and played via HTML5 Audio (no audio files).

## Data source

Set `SHEET_CSV_URL` at the top of [`src/config.js`](src/config.js) to your sheet's published CSV link
(Google Sheets: **File → Share → Publish to web → CSV**).

Columns are matched by keyword, so either the short names or the raw Google Form question text work:

| Field | Matched by |
| --- | --- |
| Full Name | "Full Name" |
| GitHub Username | "GitHub" |
| Skill Level (Advanced / Intermediate / Beginner) | "Skill Level", "experience" |
| Primary Skill (Frontend / Backend / AI / Doc) | "Primary" |
| Preferred Track | "Track" |

Other columns (such as Email Address) are ignored and never displayed. Participants are de-duplicated by GitHub username.

Note: Google caches published CSVs, so a new form response can take a minute or more to appear even though the app polls every 5 seconds.

## Team algorithm

See [`src/lib/teamAlgorithm.js`](src/lib/teamAlgorithm.js):

- Teams of 4; the remainder becomes one or two teams of 5, or a team of 3 (6 people become 3 + 3).
- Advanced participants are spread first so every team gets one before any team gets two.
- Intermediate and Beginner participants fill the remaining slots, preferring teams that lack their level and primary skill.
- A swap pass exchanges same-level members between teams to break up single-skill teams.

## Running locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173/?demo=1` to simulate registrations arriving without touching the sheet.

## Deploying to GitHub Pages

1. Push this project to a GitHub repository on the `main` branch.
2. In the repo, go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. Every push to `main` builds and deploys via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

The Vite `base` is `./`, so the site works at `https://<user>.github.io/<repo>/` without further configuration.

## On the day

- Click once to "enter the arena" – browsers require a click before sound can play.
- Top-right controls: **FULLSCREEN** (or press `F`) and **SOUND** (or press `M`; the setting is remembered).
- **SHUFFLE TEAMS** stops polling and runs the sequence; **RESHUFFLE** reruns it (after a confirmation), and **BACK TO LOBBY** resumes polling.
- The last generated teams are saved in the browser. After a refresh, use **VIEW LAST TEAMS** under the shuffle button. Demo mode keeps its own separate save.
- **COPY TEAMS** copies a plain-text list (handy for Discord/Slack); **DOWNLOAD CSV** saves a spreadsheet of the teams.
- If someone submits the form twice with the same GitHub username, their latest answers are used.
- The LIVE dot turns red and a banner appears if the sheet can't be fetched (for example if it's no longer published); polling keeps retrying.
