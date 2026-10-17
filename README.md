# ✷ Under the Same Sky — a birthday navigator

An interactive, personal birthday page built as a **night sky**. She taps
through constellations (your little moments and inside jokes), lighting each
one, until the brightest star unlocks: one big birthday message, with a living
starfield, shooting stars, a glowing moon, and sky lanterns she can tap to
burst into stardust.

Works on phone browsers and desktop. No build step, no install.

## Make it yours (2 minutes)

Everything you edit is in **one file**: [`js/config.js`](js/config.js).

1. Set `herName` and `yourName`.
2. Fill in the `chapters` (the constellations) — replace the placeholder text
   with your real moments and inside jokes. Add/remove freely.
3. Write the `finale.lines` — the actual message you want to say.
4. Add your song: put the audio file in `assets/` and set `songPath`
   (see [`assets/README.md`](assets/README.md)).

## Run it

Open it through a tiny local server (not by double-clicking the file), so the
browser doesn't block the scripts:

```bash
# from this folder
python3 -m http.server 8080 --bind 127.0.0.1
```

Then open <http://localhost:8080> in your browser.

## Sharing it with her

- Easiest: host it free on **GitHub Pages**, **Netlify**, or **Vercel** — drag
  the folder in and you get a link that works on any modern phone or laptop.

## What's inside

```
index.html        # shell
styles.css        # night-sky styling, responsive
js/config.js      # 👈 the only file you edit
js/app.js         # navigator + scenes
js/sky.js         # starfield, shooting stars, stardust, sky lanterns
assets/           # your song (and optional sky/birthday images)
```

## A note

I couldn't read your Instagram DMs (private + login-protected + against their
terms), so the personal content is yours to paste into `config.js`. That keeps
it accurate and keeps her messages private.
