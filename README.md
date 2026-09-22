# Aura Journal

Journaling for people who'd rather doom-scroll. A Gen-Z take on the daily journal: fast to capture, zero fluff, and your entries never leave your device.

**Live demo:** https://aura-journal-190775172318.us-west1.run.app/

## What it does

- **Yap** - plain text entries, for when you have thoughts
- **Rant** - voice notes, for when typing is too slow for the feeling
- **Snap** - photo entries, because some days need a picture
- **Aura Check** - a weekly AI check-in (powered by Gemini) that reads your week and hands back a mood score plus suggested activities on a vibe card
- Themes, including Vanta Black
- Folders, streaks, and a feed that feels like an app you'd actually open

## Privacy

Entries are stored locally on your device. No accounts holding your journal, no cloud database of your feelings. The only thing that touches an API is the weekly Aura Check. (The "Continue with Google" button is currently a UI placeholder - real OAuth is on the roadmap.)

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- Google Gemini (`@google/genai`) for the weekly Aura Check
- Capacitor for the Android app (in closed beta on Google Play)

## Run it locally

```bash
npm install
```

Create a `.env.local` with your Gemini API key:

```
GEMINI_API_KEY=your_key_here
```

```bash
npm run dev
```

## Android

```bash
npm run build
npm run android:init
npm run sync
npm run android:open
```

## Status

Web app is live. Android app is in closed beta on Google Play - open to testers.

## License

MIT - see [LICENSE](LICENSE).
