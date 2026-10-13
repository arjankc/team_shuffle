# Hacktoberfest Team Shuffler

A neon, cyberpunk-styled single-page app for forming hackathon teams live on a projector.

1. **Lobby** – polls the registration sheet every 5 seconds; new registrations pop onto the screen with a sound.
2. **Shuffle** – names scramble and swirl into a vortex while a countdown and ticking build suspense.
3. **Reveal** – team cards with generated names cascade in, with skill-level and primary-skill badges.

Built with React, Vite, Tailwind CSS v4 and Framer Motion. Sound effects are synthesized in the browser and played via HTML5 Audio (no audio files).

## Data source

### Recommended: Apps Script feed

The app reads registrations from a tiny Apps Script web app ([`apps-script/Code.gs`](apps-script/Code.gs)) that returns
**only** the columns the app needs, with no caching, so new registrations appear within seconds and email addresses
never leave the sheet.

1. Open the form-responses spreadsheet and go to **Extensions → Apps Script**.
2. Replace the contents of `Code.gs` with [`apps-script/Code.gs`](apps-script/Code.gs) and save.
3. **Deploy → New deployment →** type **Web app**, *Execute as:* **Me**, *Who has access:* **Anyone** → **Deploy**, and authorize it.
4. Copy the **Web app URL** (ends in `/exec`) into `FEED_URL` in [`src/config.js`](src/config.js) and push.
5. Open the URL in a private window to check it returns `{"headers":[...],"rows":[...]}` without any email column.
6. **Stop publishing the sheet:** File → Share → Publish to web → **Stop publishing**. The old CSV link then stops working.

If you later edit the script, use **Deploy → Manage deployments → Edit → New version** so the URL stays the same.

### Fallback: published CSV

If `FEED_URL` is empty, the app reads `SHEET_CSV_URL`, a sheet published via **File → Share → Publish to web → CSV**.

Columns are matched by keyword, so either the short names or the raw Google Form question text work:

| Field | Matched by |
| --- | --- |
| Full Name | "Full Name" |
| GitHub Username | "GitHub" |
| Skill Level (Advanced / Intermediate / Beginner) | "Skill Level", "experience" |
| Primary Skill (Frontend / Backend / AI / Doc) | "Primary" |
| Preferred Track | "Track" |

Other columns (such as Email Address) are ignored and never displayed. Participants are de-duplicated by GitHub username;
a submission without a username is merged with an earlier or later one under the same name.

> **Privacy (CSV fallback only):** a sheet published to the web can be downloaded by anyone, and the URL ships in the
> public site bundle. Hiding or obfuscating the URL does not help, because the browser downloads the full file. Never
> publish a tab that contains emails or other personal data; prefer the Apps Script feed.

Note: Google caches published CSVs, so with the fallback a new form response can take a minute or more to appear.

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
Use a number such as `?demo=80` to start with that many people (handy for checking that a large group fits on screen).

Run `npm test` for the unit tests (team algorithm, sheet parsing, export). The deploy workflow runs them before building.

## Deploying to GitHub Pages

1. Push this project to a GitHub repository on the `main` branch.
2. In the repo, go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. Every push to `main` builds and deploys via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

The Vite `base` is `./`, so the site works at `https://<user>.github.io/<repo>/` without further configuration.

## On the day

- The registration QR code and short link sit in the lobby's top-left corner; hover over them (or tap on a touch screen) to show them full-size in the middle of the screen. If the form link changes, update `REGISTRATION_URL` in [`src/config.js`](src/config.js) and replace [`src/assets/registration-qr.png`](src/assets/registration-qr.png).
- Click once to "enter the arena" – browsers require a click before sound can play.
- Top-right controls: **FULLSCREEN** (or press `F`) and **SOUND** (or press `M`; the setting is remembered).
- **Check-in:** click a name in the lobby to mark them absent (greyed out and left out of the shuffle); click again to undo.
  **+ WALK-IN** adds someone who didn't register; click a walk-in to remove them. A walk-in who later registers through the
  form is merged automatically. **RESET CHECK-INS** marks everyone present again. Check-ins survive a page refresh.
- The lobby and the team cards shrink automatically as numbers grow; about 80 people / 20 teams fit on a 1920×1080 screen.
- **SHUFFLE TEAMS** stops polling and runs the sequence; **RESHUFFLE** reruns it (after a confirmation), and **BACK TO LOBBY** resumes polling.
- The last generated teams are saved in the browser. After a refresh, use **VIEW LAST TEAMS** under the shuffle button. Demo mode keeps its own separate save.
- On the team screen, click one person and then someone in another team to swap them (Esc cancels). Swaps are saved and included in the exports.
- **COPY TEAMS** copies a plain-text list (handy for Discord/Slack); **DOWNLOAD CSV** saves a spreadsheet of the teams.
- If someone submits the form twice with the same GitHub username, their latest answers are used.
- The lobby mirrors the sheet: deleting a row (e.g. spam) removes that person on the next poll.
- The LIVE dot turns red and a banner appears if the sheet can't be fetched (for example if it's no longer published); polling keeps retrying.
