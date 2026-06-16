# Español Snap

An offline Spanish vocabulary **picture quiz** — a calm, one-card-at-a-time PWA you can install on your iPhone home screen. See a photo, tap the right Spanish word, use the hint if stuck. Works fully offline; progress is saved on your device.

20 categories, ~470 words, each with a real photo and a tappable hint.

## Get it on your iPhone

The app is already built into the `dist` folder. To put it on your phone:

1. **Upload it.** Open [app.netlify.com/drop](https://app.netlify.com/drop) on your PC (no account needed) and drag the whole `dist` folder onto the page. After a few seconds you'll get a link like `https://random-name-123.netlify.app` — that's your app's address.
2. **Open it on your iPhone.** In **Safari** (must be Safari, not Chrome), go to that link.
3. **Add to Home Screen.** Tap the Share button (square with an arrow pointing up) at the bottom of Safari, scroll down, and tap **"Add to Home Screen"**, then **"Add"**.
4. **Open it from your home screen.** It now runs full-screen like a normal app, with its own icon.
5. The first time you open it, leave it on Wi-Fi for a few seconds so it can download everything (~7 MB of photos). After that, it works **with no internet at all** — even in airplane mode. Your streak and progress are saved on the phone.

If you later add more words or categories and want to update the app, run `npm run build` again, drag the new `dist` folder to [app.netlify.com/drop](https://app.netlify.com/drop), and you'll get a new link — repeat steps 2-3 on your phone with the new link.

## Run it locally (after installing Node.js)

```bash
npm install      # one time — downloads dependencies
npm run dev      # start the dev server, then open the printed http://localhost link
```

To test on your **iPhone** while developing: run `npm run dev`, make sure your phone and PC are on the same Wi‑Fi, and open `http://<your-PC-IP>:5173` in Safari. (For full offline + "Add to Home Screen", we'll deploy a production build to a free host.)

```bash
npm run build    # production build into /dist
npm run preview  # preview the production build
```

## Project layout

```
src/
  data/
    categories/        ← one JSON file per category (the vocabulary)
    index.js           ← auto-loads every category file
  lib/
    quiz.js            ← option generation + which-word-next logic
    progress.js        ← streak + per-word progress (localStorage)
  components/
    Home.jsx           ← home screen (streak, stats, category grid)
    Quiz.jsx           ← the picture-quiz card
public/
  images/<category>/   ← bundled photos (fetched via the Pexels script)
REF/                   ← source reference data (frequency list, Tatoeba, dictionary)
```

## Adding vocabulary

Drop a new file in `src/data/categories/` following the same shape as `01-food-drink.json`. It's picked up automatically — no code changes needed.

## Photos

Photos are bundled into `public/images/` (so the app works offline). They're fetched per word from the Pexels API using each word's `imageQuery`, then resized to WebP. (Fetch script + API key step added during the image phase.)
