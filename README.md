# Party Hotline

Minimal Next.js app for Vercel that:

- shows the next upcoming flyer PNG on the homepage
- replies to inbound Twilio SMS messages with:
  - the party location: `The Studio, Truckee`
  - the next party date from the configured schedule
  - the sunset start time for that date

## What you need

- a Vercel account
- a Twilio account with a phone number that can receive SMS
- this repo connected to Vercel
- party flyer PNG files

## Project behavior

- The homepage reads PNG files from `public/party-flyers/`
- It parses the date from each filename
- It shows only the next upcoming flyer
- Twilio sends inbound texts to `POST /api/twilio/sms`
- The API responds with TwiML containing the party location, next party date, and sunset time

## Local development

1. Install dependencies.

   ```bash
   npm install
   ```

2. Add your flyer PNGs to `public/party-flyers/`.

3. Start the dev server.

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000`

## Flyer storage

Store flyer images in:

```text
public/party-flyers/
```

Important details:

- Only `.png` files are used for the homepage
- The flyer files are part of the repo and are deployed as static files by Vercel
- When you add, remove, or rename flyers, you need to redeploy for Vercel to serve the updated set
- Keep filenames date-based so the app can determine which flyer is next

Supported filename patterns:

- `2026-05-02.png`
- `05-02.png`
- `may-2.png`
- `party-may-2.png`

Filename rules:

- If a filename includes a year, that exact year is used
- If it only includes month and day, it is treated as a recurring yearly event
- If a PNG filename has no recognizable date, it is ignored

Recommended approach:

- Use one flyer per event
- Prefer `YYYY-MM-DD.png` for the least ambiguity
- Example:
  - `2026-05-02.png`
  - `2026-07-11.png`
  - `2026-08-01.png`
  - `2026-10-03.png`
  - `2026-12-05.png`

## Endpoints

- `GET /api/party` returns the current computed party details as JSON
- `POST /api/twilio/sms` returns TwiML for Twilio incoming message webhooks

## Deploy to Vercel

1. Push this repo to GitHub, GitLab, or Bitbucket if it is not already remote.
2. In Vercel, create a new project and import this repo.
3. Keep the framework preset as Next.js.
4. No environment variables are required for this project as currently written.
5. Deploy the project.
6. After deploy, open the Vercel domain and confirm the homepage shows the next flyer.
7. Confirm `https://your-domain/api/party` returns JSON.
8. Confirm `https://your-domain/api/twilio/sms` responds on `GET` with a preview message.

## Twilio setup in Vercel deployment

After the Vercel site is live, configure your Twilio phone number.

In the Twilio phone number configuration, set the incoming message webhook URL to:

```text
https://your-vercel-domain.vercel.app/api/twilio/sms
```

Use HTTP `POST`.

Recommended verification:

1. Text the Twilio number.
2. Make sure the reply includes:
   - `The Studio, Truckee`
   - the next party date
   - the sunset-based start time

## How to update flyers later

1. Add the new PNG file to `public/party-flyers/`.
2. Name it with a recognizable date, preferably `YYYY-MM-DD.png`.
3. Remove old flyers if you no longer want them deployed.
4. Commit and redeploy to Vercel.

If you want flyers to update without a redeploy later, the next step would be moving them out of the repo into object storage or a CMS. For the current setup, the repo-backed `public/party-flyers/` folder is the source of truth.
