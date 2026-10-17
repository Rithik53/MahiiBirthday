/* ===========================================================================
   App — the night-sky birthday navigator
   Scenes: intro -> constellation map (hub) -> constellations (story flows)
           -> finale. All personal text comes from CONFIG (js/config.js).
   =========================================================================== */

(function () {
  const stage = document.getElementById("stage");
  const progress = document.getElementById("progress");
  const musicBtn = document.getElementById("music-toggle");
  const song = document.getElementById("bg-song");

  const palette = (CONFIG.theme && CONFIG.theme.palette) || undefined;
  if (palette) SKY.setPalette(palette);

  const seen = new Set();
  let unlockedOnce = false;   // so the unlock shower only fires the first time
  let finaleLanternTimer = null;   // keeps lanterns drifting up on the message page
  let hubButterfly = null;         // the butterfly that rests on the flute
  let musicReady = false;
  let musicWanted = true;
  let currentScreen = "intro";   // which screen is showing (for the browser Back trap)

  // -------------------------------------------------------------- helpers
  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  const cx = () => window.innerWidth / 2;
  const cy = () => window.innerHeight / 2;

  let bflyUID = 0;
  function butterflySVG() {
    const id = "bf" + (bflyUID++);
    return `<svg viewBox="0 0 40 36" aria-hidden="true">` +
      `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">` +
        `<stop offset="0" stop-color="#ffe9b0"/><stop offset="0.6" stop-color="#c8a2ff"/><stop offset="1" stop-color="#7bdff2"/>` +
      `</linearGradient></defs>` +
      `<g class="wing l"><path d="M20 18 C8 2 0 8 4 18 C0 28 10 34 20 18 Z" fill="url(#${id})"/></g>` +
      `<g class="wing r"><path d="M20 18 C32 2 40 8 36 18 C40 28 30 34 20 18 Z" fill="url(#${id})"/></g>` +
      `<ellipse cx="20" cy="18" rx="1.5" ry="8" fill="#2a2140"/>` +
    `</svg>`;
  }
  const prefersReduced = () => {
    try { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
    catch (e) { return false; }
  };

  // a little butterfly flutters across on page changes (ties to the butterfly line)
  function butterflyPass() {
    if (prefersReduced()) return;
    const b = document.createElement("div");
    b.className = "butterfly";
    b.innerHTML = butterflySVG();
    document.body.appendChild(b);

    const dir = Math.random() < 0.5 ? 1 : -1;
    const W = window.innerWidth, H = window.innerHeight;
    const startX = dir === 1 ? -50 : W + 50;
    const endX = dir === 1 ? W + 50 : -50;
    const baseY = H * (0.25 + Math.random() * 0.45);
    const amp = 28 + Math.random() * 40;
    const dur = 3400 + Math.random() * 1600;
    const t0 = performance.now();
    (function step(now) {
      const t = Math.min(1, (now - t0) / dur);
      const x = startX + (endX - startX) * t;
      const y = baseY + Math.sin(t * Math.PI * 4) * amp;
      const rot = dir * Math.sin(t * Math.PI * 4) * 12;
      b.style.transform = `translate(${x}px, ${y}px) scaleX(${dir}) rotate(${rot}deg)`;
      b.style.opacity = t < 0.1 ? String(t * 10) : (t > 0.9 ? String((1 - t) * 10) : "1");
      if (t < 1) requestAnimationFrame(step); else b.remove();
    })(t0);
  }

  // a dense hive of butterflies gathers and fully covers the centre, flutters,
  // then gently drifts away (staggered) to uncover the name underneath
  // a butterfly flies in and comes to rest on the flute (hub page)
  function butterflyRest(fluteEl) {
    if (prefersReduced() || !fluteEl) return;
    const r = fluteEl.getBoundingClientRect();
    if (!r.width) return;
    const landX = r.left + r.width * 0.66 - 13;
    const landY = r.top + r.height * 0.40 - 18;
    const b = document.createElement("div");
    b.className = "butterfly";
    b.innerHTML = butterflySVG();
    b.style.width = "26px";
    document.body.appendChild(b);
    hubButterfly = b;
    const W = window.innerWidth, H = window.innerHeight;
    const sx = Math.random() < 0.5 ? -40 : W + 40;
    const sy = H * (0.18 + Math.random() * 0.3);
    const dir = sx < landX ? 1 : -1;
    const dur = 2400;
    const t0 = performance.now();
    (function fly(now) {
      if (b._gone) return;
      const t = Math.min(1, (now - t0) / dur);
      const p = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const x = sx + (landX - sx) * p + Math.sin(t * Math.PI * 5) * (1 - p) * 22;
      const y = sy + (landY - sy) * p + Math.sin(t * Math.PI * 6) * (1 - p) * 18;
      b.style.transform = `translate(${x}px, ${y}px) scaleX(${dir})`;
      b.style.opacity = String(Math.min(1, t * 4));
      if (t < 1) requestAnimationFrame(fly);
      else {
        const r0 = performance.now();
        (function idle(now2) {               // rest on the flute; follows it as the page scrolls
          if (b._gone) return;
          const rr = fluteEl.getBoundingClientRect();
          if (rr.width) {
            const lx = rr.left + rr.width * 0.66 - 13;
            const ly = rr.top + rr.height * 0.40 - 18 + Math.sin((now2 - r0) / 700) * 3;
            b.style.transform = `translate(${lx}px, ${ly}px) scaleX(${dir})`;
          }
          requestAnimationFrame(idle);
        })(r0);
      }
    })(t0);
  }
  function clearHubButterfly() {
    if (hubButterfly) { hubButterfly._gone = true; hubButterfly.remove(); hubButterfly = null; }
  }

  function butterflyReveal(count, onReveal, onDispersed) {
    if (prefersReduced()) { if (onReveal) onReveal(); if (onDispersed) onDispersed(); return; }
    const W = window.innerWidth, H = window.innerHeight;
    const cxp = W / 2, cyp = H * 0.40;
    const spreadX = Math.min(W * 0.42, 440), spreadY = Math.min(H * 0.24, 220);
    const ease = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
    const lerp = (a, b, p) => a + (b - a) * p;
    const flies = [];
    for (let i = 0; i < count; i++) {
      const fe = document.createElement("div");
      fe.className = "butterfly";
      fe.innerHTML = butterflySVG();
      fe.style.width = (22 + Math.random() * 20).toFixed(0) + "px";
      document.body.appendChild(fe);
      const edge = Math.random();
      let sx, sy;
      if (edge < 0.25) { sx = -60; sy = Math.random() * H; }
      else if (edge < 0.5) { sx = W + 60; sy = Math.random() * H; }
      else if (edge < 0.75) { sx = Math.random() * W; sy = -60; }
      else { sx = Math.random() * W; sy = H + 60; }
      const tx = cxp + (Math.random() * 2 - 1) * spreadX;
      const ty = cyp + (Math.random() * 2 - 1) * spreadY;
      const ang = Math.atan2(ty - cyp, tx - cxp) + (Math.random() * 0.8 - 0.4);
      const dist = Math.max(W, H) * 1.05;
      flies.push({
        el: fe, sx, sy, tx, ty,
        dx: tx + Math.cos(ang) * dist, dy: ty + Math.sin(ang) * dist,
        ph: Math.random() * Math.PI * 2, bob: 6 + Math.random() * 9,
        gdur: 1200 + Math.random() * 600,
        sdelay: Math.random() * 900,
        sdur: 2800 + Math.random() * 1500,     // slow, gentle fly-away
        dir: sx < tx ? 1 : -1,
      });
    }
    const gatherMax = 1800, hold = 1500, uncoverAt = gatherMax + hold;
    const t0 = performance.now();
    let revealed = false, dispersed = false;
    (function step(now) {
      const t = now - t0;
      let allGone = true;
      for (const f of flies) {
        let bx, by, op;
        const scatterStart = uncoverAt + f.sdelay;
        if (t < f.gdur) {                         // flying in
          const p = ease(t / f.gdur);
          bx = lerp(f.sx, f.tx, p); by = lerp(f.sy, f.ty, p);
          op = Math.min(1, t / 400); allGone = false;
        } else if (t < scatterStart) {            // hovering in the hive
          bx = f.tx; by = f.ty; op = 1; allGone = false;
        } else {                                  // gently drifting out
          const st = t - scatterStart;
          if (st < f.sdur) {
            const p = ease(st / f.sdur);
            bx = lerp(f.tx, f.dx, p); by = lerp(f.ty, f.dy, p);
            op = 1 - ease(st / f.sdur); allGone = false;
          } else { bx = f.dx; by = f.dy; op = 0; }
        }
        // one continuous wobble across every phase = no abrupt jumps
        const x = bx + Math.sin(now / 220 + f.ph) * f.bob;
        const y = by + Math.cos(now / 190 + f.ph) * f.bob;
        f.el.style.transform = `translate(${x}px, ${y}px) scaleX(${f.dir})`;
        f.el.style.opacity = String(Math.max(0, op));
      }
      if (!revealed && t >= uncoverAt) { revealed = true; if (onReveal) onReveal(); }
      if (allGone) {
        if (!dispersed) { dispersed = true; if (onDispersed) onDispersed(); }
        flies.forEach((f) => f.el.remove());
        return;
      }
      requestAnimationFrame(step);
    })(t0);
  }

  // {her} / {me} tokens can be used anywhere in config text
  const fill = (s) =>
    s == null ? s : String(s)
      .replace(/\{her\}/gi, CONFIG.herName || "you")
      .replace(/\{me\}/gi, CONFIG.yourName || "me");

  function swap(node) {
    // stop the finale's lantern stream + clear the star-name whenever we leave a scene
    if (finaleLanternTimer) { clearInterval(finaleLanternTimer); finaleLanternTimer = null; }
    if (typeof SKY !== "undefined" && SKY.clearName) SKY.clearName();
    clearHubButterfly();
    clearSunflowers();   // remove any viewport-anchored sunflowers from the previous page
    clearGarden();       // and the garden backdrop
    // remove the outgoing scene immediately so the two don't stack and jump;
    // only the incoming scene animates (opacity + transform = GPU-smooth)
    const old = stage.firstElementChild;
    if (old) old.remove();
    stage.appendChild(node);
    // long finale scenes scroll from the top (with a sticky heading) instead of centering
    stage.classList.toggle("scroll-top", node.classList.contains("finale-scene"));
    // Dearest Mahii only: fade message text that sits below the darkened zone
    // (over the bright garden), so it only shows once scrolled up into the dark
    stage.classList.toggle("garden-mask",
      node.classList.contains("finale-scene") && !node.classList.contains("grand-scene"));
    document.body.classList.toggle("on-hub", node.classList.contains("hub-scene"));
    stage.scrollTop = 0;
    // single butterfly on normal transitions; the grand finale has its own swarm
    if (!node.classList.contains("grand-scene")) butterflyPass();
  }

  // a set of distinct little constellations, one per card
  const CONSTELLATIONS = [
    [[6, 26], [16, 10], [26, 20], [38, 8], [42, 24]],        // zigzag
    [[8, 8], [18, 22], [30, 12], [40, 26]],                   // W / ladder
    [[6, 18], [16, 22], [26, 16], [34, 24], [42, 10]],        // dipper
    [[24, 5], [14, 16], [24, 28], [34, 16], [24, 5]],         // kite (closes)
    [[8, 24], [20, 14], [24, 26], [36, 10], [42, 22]],        // scatter
  ];
  function miniStarsSVG(idx) {
    const pts = CONSTELLATIONS[idx % CONSTELLATIONS.length];
    let dots = "", lines = "";
    for (let i = 0; i < pts.length; i++) {
      // skip drawing a duplicate dot on a closing point
      const isClose = i === pts.length - 1 && pts[i][0] === pts[0][0] && pts[i][1] === pts[0][1];
      if (!isClose) dots += `<circle cx="${pts[i][0]}" cy="${pts[i][1]}" r="1.6" fill="#ffe9b0"/>`;
      if (i > 0) lines += `<line x1="${pts[i-1][0]}" y1="${pts[i-1][1]}" x2="${pts[i][0]}" y2="${pts[i][1]}" stroke="#ffe9b0" stroke-width="0.6" opacity="0.6"/>`;
    }
    return `<svg class="mini-stars" viewBox="0 0 48 34">${lines}${dots}</svg>`;
  }

  // a painterly Van Gogh style swirl star (layered brushy spiral + glowing core)
  function swirlPath(cxp, cyp, turns, maxR, pts) {
    let d = "";
    for (let k = 0; k <= pts; k++) {
      const t = k / pts;
      const ang = t * turns * Math.PI * 2;
      const r = t * maxR;
      const x = (cxp + Math.cos(ang) * r).toFixed(1);
      const y = (cyp + Math.sin(ang) * r).toFixed(1);
      d += (k === 0 ? "M" : "L") + x + "," + y + " ";
    }
    return d;
  }
  function swirlStarSVG() {
    const turns = 2.1 + Math.random() * 0.8;
    const p = swirlPath(24, 24, turns, 19, 64);
    return `<svg viewBox="0 0 48 48">` +
      `<path d="${p}" fill="none" stroke="#2f5fbf" stroke-width="4.5" stroke-linecap="round" opacity="0.45"/>` +
      `<path d="${p}" fill="none" stroke="#5f9bf0" stroke-width="2.6" stroke-linecap="round" opacity="0.85"/>` +
      `<path d="${p}" fill="none" stroke="#dbeaff" stroke-width="1" stroke-linecap="round"/>` +
      `<circle cx="24" cy="24" r="3.2" fill="#fff7d6"/>` +
    `</svg>`;
  }

  // a painterly flower (two layers of brushy petals + glowing heart) that unfurls
  function flowerSVG() {
    const outerPetal = "M50,50 C41,29 43,17 50,9 C57,17 59,29 50,50 Z";
    const innerPetal = "M50,50 C45,36 46,27 50,21 C54,27 55,36 50,50 Z";
    let outer = "", inner = "";
    const N = 8;
    for (let k = 0; k < N; k++) {
      outer += `<path d="${outerPetal}" transform="rotate(${k * (360 / N)} 50 50)" fill="url(#pgA)" stroke="#5b3fb0" stroke-width="0.7" opacity="0.96"/>`;
    }
    for (let k = 0; k < N; k++) {
      inner += `<path d="${innerPetal}" transform="rotate(${k * (360 / N) + 22.5} 50 50)" fill="url(#pgB)" opacity="0.95"/>`;
    }
    return `<svg viewBox="0 0 100 100">` +
      `<defs>` +
        `<radialGradient id="pgA" cx="50%" cy="82%" r="72%">` +
          `<stop offset="0%" stop-color="#e3d8ff"/><stop offset="55%" stop-color="#9a7bff"/><stop offset="100%" stop-color="#6144c9"/>` +
        `</radialGradient>` +
        `<radialGradient id="pgB" cx="50%" cy="82%" r="72%">` +
          `<stop offset="0%" stop-color="#f1ebff"/><stop offset="60%" stop-color="#b49bff"/><stop offset="100%" stop-color="#8a6fe6"/>` +
        `</radialGradient>` +
        `<radialGradient id="cgA" cx="50%" cy="42%" r="62%">` +
          `<stop offset="0%" stop-color="#fff3b0"/><stop offset="70%" stop-color="#f5b73c"/><stop offset="100%" stop-color="#d98f28"/>` +
        `</radialGradient>` +
      `</defs>` +
      `<g class="petals">${outer}${inner}</g>` +
      `<circle class="fcore" cx="50" cy="50" r="9" fill="url(#cgA)"/>` +
    `</svg>`;
  }

  // a full sunflower (petals + seed head + stem + leaves) — she likes these
  function sunflowerSVG() {
    const cx = 50, cy = 44, N = 18;
    let outer = "", inner = "";
    for (let k = 0; k < N; k++) {
      outer += `<ellipse cx="50" cy="19" rx="5.4" ry="15.5" fill="url(#sfp)" stroke="#e39500" stroke-width="0.5" transform="rotate(${k * (360 / N)} ${cx} ${cy})"/>`;
    }
    for (let k = 0; k < N; k++) {
      inner += `<ellipse cx="50" cy="28" rx="3.8" ry="10" fill="url(#sfp2)" transform="rotate(${k * (360 / N) + 10} ${cx} ${cy})"/>`;
    }
    return `<svg viewBox="0 0 100 190">` +
      `<defs>` +
        `<linearGradient id="sfp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe24d"/><stop offset="1" stop-color="#ffab00"/></linearGradient>` +
        `<linearGradient id="sfp2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd21a"/><stop offset="1" stop-color="#f59300"/></linearGradient>` +
        `<radialGradient id="sfc" cx="50%" cy="42%" r="60%"><stop offset="0" stop-color="#8a5a24"/><stop offset="0.6" stop-color="#5d3614"/><stop offset="1" stop-color="#3c230f"/></radialGradient>` +
      `</defs>` +
      // stem
      `<path d="M50,46 C47,92 51,140 50,188" stroke="#3f8f3a" stroke-width="5" fill="none" stroke-linecap="round"/>` +
      // leaves
      `<path d="M50,108 C28,98 17,110 13,126 C33,129 46,123 50,110 Z" fill="#49a842"/>` +
      `<path d="M50,138 C72,128 83,140 87,156 C67,159 54,152 50,140 Z" fill="#3f8f3a"/>` +
      // head
      `<g class="sf-head">${outer}${inner}` +
        `<circle cx="${cx}" cy="${cy}" r="14.5" fill="url(#sfc)"/>` +
        `<circle cx="${cx}" cy="${cy}" r="14.5" fill="none" stroke="#2d1b0a" stroke-width="0.8" opacity="0.45"/>` +
      `</g>` +
    `</svg>`;
  }
  // place two sunflowers flanking a title, mounted inside the (sticky) header so
  // they stay next to "Dearest Mahii" and don't scroll away
  function mountSunflowers(host) {
    if (!host) return;
    ["left", "right"].forEach((side) => {
      const sf = el("div", "sunflower " + side);
      sf.setAttribute("aria-hidden", "true");
      sf.innerHTML = sunflowerSVG();
      host.appendChild(sf);
      requestAnimationFrame(() => requestAnimationFrame(() => sf.classList.add("show")));
    });
  }
  function clearSunflowers() {
    document.querySelectorAll(".sunflower").forEach((n) => n.remove());
  }
  // the borrowed garden, embedded as a transparent backdrop iframe (grows behind
  // the Dearest Mahii message). Mounted on <body> so it stays viewport-anchored.
  function mountGarden() {
    clearGarden();
    const glow = document.createElement("div");   // warm centre glow (project #halo)
    glow.className = "garden-glow";
    document.body.appendChild(glow);
    const f = document.createElement("iframe");
    f.className = "garden-frame";
    f.setAttribute("tabindex", "-1");
    f.setAttribute("aria-hidden", "true");
    f.setAttribute("scrolling", "no");
    f.src = "garden.html?t=" + Date.now();   // fresh each visit so it re-grows
    document.body.appendChild(f);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      f.classList.add("show");
      glow.classList.add("show");
    }));
  }
  function clearGarden() {
    document.querySelectorAll(".garden-frame, .finale-focus, .garden-glow").forEach((n) => n.remove());
  }

  // rounded-rectangle path (for the thread tying around the text box)
  function roundedRectPath(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    return `M${x + r},${y} H${x + w - r} A${r},${r} 0 0 1 ${x + w},${y + r} ` +
      `V${y + h - r} A${r},${r} 0 0 1 ${x + w - r},${y + h} H${x + r} ` +
      `A${r},${r} 0 0 1 ${x},${y + h - r} V${y + r} A${r},${r} 0 0 1 ${x + r},${y} Z`;
  }

  function finaleSignoff() {
    const s = CONFIG.finale.signoff;
    if (s && s !== "Me") return fill(s);
    return CONFIG.yourName || "Me";
  }

  // -------------------------------------------------------------- progress
  function renderProgress() {
    progress.innerHTML = "";
    CONFIG.chapters.forEach((c) => {
      const dot = el("i", null, seen.has(c.id) ? "✷" : "✦");
      if (seen.has(c.id)) dot.classList.add("on");
      progress.appendChild(dot);
    });
  }
  const showProgress = (show) => progress.classList.toggle("show", !!show);

  // -------------------------------------------------------------- music
  const vinyl = document.getElementById("vinyl");
  const nowPlaying = document.getElementById("now-playing");
  const npText = nowPlaying ? nowPlaying.querySelector(".np-text") : null;
  const songNext = document.getElementById("song-next");
  const chapterAudio = new Audio();   // per-chapter looping clip
  chapterAudio.loop = true;
  const grandAudio = new Audio();     // soft background under the grand-finale fireworks
  grandAudio.loop = true;
  let grandMode = false;              // true while the grand finale bg is active
  const GRAND_VOL = 0.85;             // file is already quietened at source, so play it fuller
  let currentChapterSong = null;
  let currentLabel = CONFIG.songLabel || "";   // what the now-playing label shows
  let playlist = null;   // when set (e.g. finale), play tracks in order then loop the set
  let playlistIdx = 0;
  // ---- hub playlist: a list of songs (looping). Between songs we fade out/in;
  //      a song's `parts` play GAPLESS so a split track still feels like one song.
  let hubSongs = null;              // [{ label, parts:[src,...] }]
  let hubSongIdx = 0, hubPartIdx = 0, hubGuard = false;
  const HUB_FADEOUT = 0.9;          // seconds, fade-out at the end of a song
  function hubInit() {
    if (hubSongs) return;
    if (!(CONFIG.songList && CONFIG.songList.length)) { hubSongs = null; return; }
    hubSongs = CONFIG.songList.map((s) => {
      if (typeof s === "string") return { label: CONFIG.songLabel || "", parts: [s] };
      const parts = (s.parts && s.parts.length) ? s.parts.slice() : (s.src ? [s.src] : []);
      return { label: s.label || CONFIG.songLabel || "", parts };
    }).filter((s) => s.parts.length);
    if (!hubSongs.length) hubSongs = null;
  }
  // prepare the hub element to play (first run sets song 0 / part 0; otherwise resumes)
  function hubPrepare() {
    hubInit();
    if (!hubSongs) return false;
    song.loop = false;             // we advance between parts/songs ourselves
    if (!song.src) {
      hubSongIdx = 0; hubPartIdx = 0;
      try { song.src = hubSongs[0].parts[0]; } catch (e) { /* ignore */ }
    }
    currentLabel = hubSongs[hubSongIdx] ? hubSongs[hubSongIdx].label : (CONFIG.songLabel || "");
    return true;
  }
  // move to the next song in the hub set (fades the next song IN)
  function hubAdvanceSong() {
    if (!hubSongs) return;
    hubGuard = true;
    hubSongIdx = (hubSongIdx + 1) % hubSongs.length;
    hubPartIdx = 0;
    const ns = hubSongs[hubSongIdx];
    currentLabel = ns.label;
    try { song.src = ns.parts[0]; } catch (e) { /* ignore */ }
    hubGuard = false;
    if (musicWanted) fadeInPlay(song, 1200, 250);
  }
  // when a hub part ends: next part is gapless; end of the last part hands off
  song.addEventListener("ended", () => {
    if (!hubSongs || hubGuard) return;
    const cur = hubSongs[hubSongIdx];
    if (hubPartIdx < cur.parts.length - 1) {
      hubPartIdx++;
      try { song.src = cur.parts[hubPartIdx]; song.play(); } catch (e) { /* ignore */ }   // gapless
    } else if (hubSongs.length < 2) {
      hubPartIdx = 0;
      try { song.src = cur.parts[0]; song.play(); } catch (e) { /* ignore */ }            // loop single song gapless
    } else {
      hubAdvanceSong();   // fallback if the fade-out (below) didn't catch the end
    }
  });
  // fade the current song OUT near the end of its last part, then hand off
  song.addEventListener("timeupdate", () => {
    if (!hubSongs || hubGuard || hubSongs.length < 2) return;
    const cur = hubSongs[hubSongIdx];
    if (hubPartIdx !== cur.parts.length - 1) return;   // only on the song's final part
    const d = song.duration;
    if (!isFinite(d) || d <= 0) return;
    if (song.currentTime >= d - HUB_FADEOUT) {
      hubGuard = true;
      fadeAudio(song, 0, HUB_FADEOUT * 1000, () => hubAdvanceSong());
    }
  });
  let trimGuard = false;   // so an early-trim advance only fires once per track
  function advancePlaylist() {
    if (!playlist || playlist.length < 2) return;
    trimGuard = true;   // block any further triggers until the next track loads
    playlistIdx = (playlistIdx + 1) % playlist.length;
    const item = playlist[playlistIdx];
    currentChapterSong = item.src;
    currentLabel = item.label || "";
    try { chapterAudio.src = item.src; } catch (e) { /* ignore */ }
    trimGuard = false;
    if (musicWanted) fadeInPlay(chapterAudio, 1200, 250);   // ease the next track in
  }
  // advance when a track finishes (loop=false during a playlist)
  chapterAudio.addEventListener("ended", () => { if (!trimGuard) advancePlaylist(); });
  // Distinct stacked songs (chapters/finale): fade the current track OUT as it
  // nears its end (or its trim point), then advancePlaylist fades the next one IN.
  const PLAYLIST_FADEOUT = 0.9;   // seconds
  chapterAudio.addEventListener("timeupdate", () => {
    if (!playlist || trimGuard) return;
    const d = chapterAudio.duration;
    if (!isFinite(d) || d <= 0) return;
    const item = playlist[playlistIdx];
    const trim = (item && item.trimEndMs) ? item.trimEndMs / 1000 : 0;
    const switchAt = d - trim;                        // when we leave this track
    if (chapterAudio.currentTime >= switchAt - PLAYLIST_FADEOUT) {
      trimGuard = true;                               // lock out further triggers
      fadeAudio(chapterAudio, 0, PLAYLIST_FADEOUT * 1000, () => advancePlaylist());
    }
  });

  const anyAudio = () => !!CONFIG.songPath || (CONFIG.songList && CONFIG.songList.length) || (CONFIG.chapters || []).some((c) => c.song);

  // smoothly ramp an audio element's volume to a target over `ms`, then call done()
  // ---- Web Audio graph: iOS Safari ignores HTMLAudio.volume, so we fade a
  //      GainNode instead. Falls back to element.volume where Web Audio is absent.
  let audioCtx = null;
  function getCtx() {
    if (audioCtx) return audioCtx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { audioCtx = new AC(); } catch (e) { audioCtx = null; }
    return audioCtx;
  }
  function resumeAudioCtx() {
    const ctx = getCtx();
    if (ctx && ctx.state === "suspended") { try { ctx.resume(); } catch (e) { /* ignore */ } }
  }
  // route an <audio> element through source -> gain -> destination (once)
  function gainFor(a) {
    const ctx = getCtx();
    if (!ctx) return null;
    if (a._gain || a._gain === null) return a._gain;   // already attempted
    try {
      const src = ctx.createMediaElementSource(a);
      const g = ctx.createGain();
      g.gain.value = (a._wantVol != null) ? a._wantVol : 1;
      src.connect(g); g.connect(ctx.destination);
      a._srcNode = src; a._gain = g;
    } catch (e) { a._gain = null; }   // creating twice throws -> mark as unavailable
    return a._gain;
  }

  // smoothly ramp an element's level to `target` over `ms`, then call done()
  function fadeAudio(a, target, ms, done) {
    if (!a) { if (done) done(); return; }
    if (a._fadeTimer) { clearTimeout(a._fadeTimer); clearInterval(a._fadeTimer); a._fadeTimer = null; }
    target = Math.max(0, Math.min(1, target));
    a._wantVol = target;
    const g = gainFor(a);
    if (g && audioCtx) {
      const now = audioCtx.currentTime;
      try {
        g.gain.cancelScheduledValues(now);
        g.gain.setValueAtTime(g.gain.value, now);
        g.gain.linearRampToValueAtTime(target, now + Math.max(0.01, ms / 1000));
      } catch (e) { try { g.gain.value = target; } catch (e2) { /* ignore */ } }
      if (done) a._fadeTimer = setTimeout(() => { a._fadeTimer = null; done(); }, ms + 40);
      return;
    }
    // fallback: ramp element.volume (works on desktop; ignored on iOS)
    let start = a.volume;
    if (isNaN(start)) start = target;
    const steps = Math.max(1, Math.round(ms / 40));
    let i = 0;
    a._fadeTimer = setInterval(() => {
      i++;
      const v = start + (target - start) * (i / steps);
      try { a.volume = Math.max(0, Math.min(1, v)); } catch (e) { /* ignore */ }
      if (i >= steps) { clearInterval(a._fadeTimer); a._fadeTimer = null; if (done) done(); }
    }, 40);
  }
  // start an element from silence, hold it quiet for `delayMs`, then fade it up
  // over `ms`. We call play() immediately (iOS needs it inside the user gesture)
  // but keep the gain at 0 during the lead-in so the start never feels abrupt.
  function fadeInPlay(a, ms, delayMs, target) {
    delayMs = delayMs || 0;
    target = (target == null) ? 1 : Math.max(0, Math.min(1, target));
    resumeAudioCtx();
    if (a._fadeTimer) { clearTimeout(a._fadeTimer); clearInterval(a._fadeTimer); a._fadeTimer = null; }
    a._wantVol = target;
    const g = gainFor(a);
    const rampUp = () => {
      const gg = a._gain;
      if (gg && audioCtx) {
        const now = audioCtx.currentTime;
        try {
          gg.gain.cancelScheduledValues(now);
          gg.gain.setValueAtTime(0, now);
          gg.gain.linearRampToValueAtTime(target, now + Math.max(0.01, ms / 1000));
        } catch (e) { try { gg.gain.value = target; } catch (e2) {} }
      } else {
        fadeAudio(a, target, ms);
      }
    };
    // pin to silence right away
    if (g && audioCtx) {
      try { g.gain.cancelScheduledValues(audioCtx.currentTime); g.gain.setValueAtTime(0, audioCtx.currentTime); } catch (e) { /* ignore */ }
    } else { try { a.volume = 0; } catch (e) { /* ignore */ } }
    const p = a.play();
    const begin = () => {
      setMusicUI(true);
      if (delayMs > 0) a._fadeTimer = setTimeout(() => { a._fadeTimer = null; rampUp(); }, delayMs);
      else rampUp();
    };
    if (p && p.catch) p.then(begin).catch(() => setMusicUI(false));
    else begin();
  }

  function startMusicIfPossible() {
    const hasList = CONFIG.songList && CONFIG.songList.length;
    if ((!CONFIG.songPath && !hasList) || currentChapterSong) return;   // a chapter clip takes over when present
    if (hasList) {
      if (!hubPrepare()) return;
    } else {
      hubSongs = null; song.loop = true;
      currentLabel = CONFIG.songLabel || "";
      if (!song.src) song.src = CONFIG.songPath;
    }
    if (!musicWanted) return;
    fadeInPlay(song, 1300, 700);
    musicReady = true;
  }
  function setMusicUI(playing) {
    musicBtn.classList.toggle("playing", playing);
    musicBtn.classList.toggle("muted", !playing);
    if (vinyl) vinyl.classList.toggle("spinning", playing);
    if (nowPlaying) {
      if (npText) npText.textContent = currentLabel ? ("♪ " + currentLabel) : "";
      nowPlaying.classList.toggle("show", playing && !!currentLabel);
      // show the skip button when this screen has more than one song to move between:
      // a chapter/finale stack, or the hub when it holds multiple songs
      const multiChap = !!(playlist && playlist.length > 1);
      const multiHub = !!(hubSongs && hubSongs.length > 1 && !playlist && !currentChapterSong && !grandMode);
      nowPlaying.classList.toggle("has-next", (multiChap || multiHub) && playing && !!currentLabel);
    }
  }

  // play a chapter's own clip (looping), crossfading out the global background song
  function startChapterAudio(src, label) {
    playlist = null; chapterAudio.loop = true;   // single looping clip (not a sequence)
    currentChapterSong = src;
    currentLabel = label || "";
    try { if (!chapterAudio.src || chapterAudio.src.indexOf(src) === -1) chapterAudio.src = src; }
    catch (e) { chapterAudio.src = src; }
    // fade the hub song out, then pause it
    if (song.src && !song.paused) fadeAudio(song, 0, 900, () => { try { song.pause(); } catch (e) {} });
    else { try { song.pause(); } catch (e) {} }
    if (!musicWanted) { setMusicUI(false); return; }
    fadeInPlay(chapterAudio, 1300, 950);   // settle on the page, then swell in
  }
  // play a list of {src,label} in order, then loop the whole set (used by the finale)
  function startChapterPlaylist(list) {
    if (!list || !list.length) return;
    playlist = list;
    playlistIdx = 0;
    chapterAudio.loop = false;   // sequence advances on the "ended" event
    const first = list[0];
    currentChapterSong = first.src;
    currentLabel = first.label || "";
    try { chapterAudio.src = first.src; } catch (e) { /* ignore */ }
    if (song.src && !song.paused) fadeAudio(song, 0, 900, () => { try { song.pause(); } catch (e) {} });
    else { try { song.pause(); } catch (e) {} }
    if (!musicWanted) { setMusicUI(false); return; }
    fadeInPlay(chapterAudio, 1300, 950);
  }
  // stop the chapter clip and crossfade the global background (hub) song back
  function stopChapterAudio() {
    if (!currentChapterSong) return;
    playlist = null; chapterAudio.loop = true;   // leave sequence mode
    currentChapterSong = null;
    currentLabel = CONFIG.songLabel || "";
    fadeAudio(chapterAudio, 0, 900, () => { try { chapterAudio.pause(); } catch (e) {} });
    const hasList = CONFIG.songList && CONFIG.songList.length;
    if (musicWanted && (CONFIG.songPath || hasList)) {
      if (hasList) hubPrepare();
      else if (!song.src) { song.src = CONFIG.songPath; }
      fadeInPlay(song, 1300, 600);
    } else {
      setMusicUI(false);
    }
  }
  // silence everything (hub + chapter/finale) without resuming anything — for the
  // grand finale, which is fireworks only. Hub position is kept so it can resume later.
  function stopAllMusic() {
    playlist = null; chapterAudio.loop = true;
    currentChapterSong = null;
    grandMode = false;
    fadeAudio(chapterAudio, 0, 500, () => { try { chapterAudio.pause(); } catch (e) {} });
    fadeAudio(song, 0, 500, () => { try { song.pause(); } catch (e) {} });
    fadeAudio(grandAudio, 0, 500, () => { try { grandAudio.pause(); } catch (e) {} });
    setMusicUI(false);
  }
  // soft instrumental under the grand-finale fireworks (lower volume so booms cut through)
  function startGrandMusic() {
    const gf = CONFIG.grandFinale || {};
    // stop the finale/hub audio without resuming anything
    playlist = null; chapterAudio.loop = true; currentChapterSong = null;
    fadeAudio(chapterAudio, 0, 500, () => { try { chapterAudio.pause(); } catch (e) {} });
    fadeAudio(song, 0, 500, () => { try { song.pause(); } catch (e) {} });
    if (!gf.song) { grandMode = false; setMusicUI(false); return; }   // fireworks-only
    grandMode = true;
    currentChapterSong = null;
    currentLabel = gf.songLabel || "";
    try { if (!grandAudio.src || grandAudio.src.indexOf(gf.song) === -1) grandAudio.src = gf.song; }
    catch (e) { grandAudio.src = gf.song; }
    if (!musicWanted) { setMusicUI(false); return; }
    fadeInPlay(grandAudio, 1800, 400, GRAND_VOL);   // ease in gently, under the fireworks
  }
  function stopGrandMusic() {
    grandMode = false;
    fadeAudio(grandAudio, 0, 500, () => { try { grandAudio.pause(); } catch (e) {} });
  }
  // duck the song down while fireworks are bursting (booms up front), then
  // bring it back to the front once the show is over
  const GRAND_DUCK = 0.3;              // quiet level during the fireworks
  function duckGrandMusic() {
    if (grandMode && musicWanted) fadeAudio(grandAudio, GRAND_DUCK, 900);
  }
  function unduckGrandMusic() {
    if (grandMode && musicWanted) fadeAudio(grandAudio, GRAND_VOL, 1400);
  }

  musicBtn.addEventListener("click", () => {
    resumeAudioCtx();
    musicWanted = !musicWanted;
    if (!musicWanted) {
      // ease out whichever clip is active, then pause
      fadeAudio(song, 0, 450, () => { try { song.pause(); } catch (e) {} });
      fadeAudio(chapterAudio, 0, 450, () => { try { chapterAudio.pause(); } catch (e) {} });
      fadeAudio(grandAudio, 0, 450, () => { try { grandAudio.pause(); } catch (e) {} });
      setMusicUI(false);
      return;
    }
    if (grandMode) {
      fadeInPlay(grandAudio, 600, 0, GRAND_VOL);
    } else if (currentChapterSong) {
      fadeInPlay(chapterAudio, 600);
    } else if (CONFIG.songList && CONFIG.songList.length) {
      hubPrepare();
      fadeInPlay(song, 600);
    } else if (CONFIG.songPath) {
      if (!song.src) song.src = CONFIG.songPath;
      fadeInPlay(song, 600);
    }
  });
  if (!anyAudio()) musicBtn.style.display = "none";

  // skip to the next stacked song (only visible on screens with a playlist)
  if (songNext) songNext.addEventListener("click", (e) => {
    e.stopPropagation();
    resumeAudioCtx();
    if (playlist && playlist.length > 1) {
      trimGuard = true;   // block the auto-advance while we manually fade over
      fadeAudio(chapterAudio, 0, 250, () => advancePlaylist());
    } else if (hubSongs && hubSongs.length > 1 && !playlist && !currentChapterSong && !grandMode) {
      hubGuard = true;    // block the end-of-song auto hand-off while we fade over
      fadeAudio(song, 0, 250, () => hubAdvanceSong());
    }
  });

  // -------------------------------------------------------------- INTRO
  function renderIntro() {
    currentScreen = "intro";
    showProgress(false);
    stopGrandMusic();     // stop grand-finale bg if we came from "watch the sky again"
    stopChapterAudio();   // reset any chapter/finale clip on (re)start
    const scene = el("div", "scene");
    scene.appendChild(el("p", "kicker", CONFIG.intro.kicker || ""));
    scene.appendChild(el("h1", "title", `${CONFIG.intro.title} <span class="name">${CONFIG.herName} ✷</span>`));
    scene.appendChild(el("p", "subtitle", CONFIG.intro.subtitle || ""));
    const btn = el("button", "btn", CONFIG.intro.button || "Open the sky →");
    btn.addEventListener("click", () => {
      if (CONFIG.consent) { renderConsent(); return; }   // privacy-lawyer gag
      enterSky();
    });
    scene.appendChild(btn);
    swap(scene);
  }

  // fx + music + into the hub (music start needs a user gesture, which we have)
  function enterSky() {
    try { SKY.unlockAudio && SKY.unlockAudio(); } catch (e) { /* ignore */ }   // unlock sound on mobile
    try { resumeAudioCtx(); } catch (e) { /* ignore */ }   // wake Web Audio graph (iOS fades)
    try { startMusicIfPossible(); } catch (e) { /* ignore */ }
    try { SKY.shootingStar(); SKY.stardustBurst(cx(), cy(), palette); } catch (e) { /* ignore */ }
    renderHub();
  }

  // -------------------------------------------------------------- CONSENT (joke)
  function renderConsent() {
    showProgress(false);
    const c = CONFIG.consent || {};
    const scene = el("div", "scene consent-scene");
    if (c.kicker) scene.appendChild(el("p", "kicker", c.kicker));
    scene.appendChild(el("h2", "title", c.title || "Consent Required"));
    if (c.subtitle) scene.appendChild(el("p", "subtitle", c.subtitle));

    const card = el("div", "consent-card");
    const ul = el("ul");
    (c.clauses || []).forEach((cl) => ul.appendChild(el("li", null, fill(cl))));
    card.appendChild(ul);
    const label = el("label", "consent-check");
    const box = el("input"); box.type = "checkbox";
    label.appendChild(box);
    label.appendChild(el("span", null, fill(c.check || "I agree.")));
    card.appendChild(label);
    scene.appendChild(card);

    const reply = el("p", "consent-reply");
    scene.appendChild(reply);

    const row = el("div", "btn-row");
    const reject = el("button", "btn ghost", c.rejectLabel || "Reject all");
    const accept = el("button", "btn", c.acceptLabel || "I consent ✨");
    accept.disabled = true;
    box.addEventListener("change", () => { accept.disabled = !box.checked; if (box.checked) reply.textContent = ""; });
    reject.addEventListener("click", () => { reply.textContent = fill(c.rejectReply || "Denied. 🙂"); });
    accept.addEventListener("click", () => {
      if (accept.disabled) return;
      if (CONFIG.musicGate) renderMusicGate();   // ask about sound before entering
      else enterSky();
    });
    row.appendChild(reject);
    row.appendChild(accept);
    scene.appendChild(row);
    swap(scene);
  }

  // ---------------------------------------------------- MUSIC GATE (sound on?)
  function renderMusicGate() {
    const m = CONFIG.musicGate || {};
    const scene = el("div", "scene music-gate");
    scene.appendChild(el("h2", "title", m.title || "Sound on?"));
    if (m.subtitle) scene.appendChild(el("p", "subtitle", m.subtitle));

    const row = el("div", "btn-row");
    const yes = el("button", "btn", m.yesLabel || "🎵 Play it");
    const no = el("button", "btn ghost", m.noLabel || "🔇 I'll pass");
    row.appendChild(yes);
    row.appendChild(no);
    scene.appendChild(row);
    swap(scene);

    let done = false;
    const choose = (wantMusic) => {
      if (done) return; done = true;
      musicWanted = wantMusic;
      if (!wantMusic) setMusicUI(false);   // show the muted icon straight away
      const icon = wantMusic ? (m.yesIcon || "🎵") : (m.noIcon || "🔇");
      flyIconToToggle(icon, () => enterSky());
    };
    yes.addEventListener("click", () => choose(true));
    no.addEventListener("click", () => choose(false));
  }

  // a chosen icon lifts from the center and flies up to the music toggle, then
  // the toggle gets a little pop as it "lands"
  function flyIconToToggle(icon, done) {
    const fly = el("div", "fly-icon", icon);
    document.body.appendChild(fly);
    // start near the center of the screen
    const sx = window.innerWidth / 2;
    const sy = window.innerHeight * 0.5;
    const r = musicBtn.getBoundingClientRect();
    const tx = r.left + r.width / 2;
    const ty = r.top + r.height / 2;
    fly.style.left = sx + "px";
    fly.style.top = sy + "px";
    requestAnimationFrame(() => requestAnimationFrame(() => {
      fly.style.transform = `translate(-50%, -50%) translate(${tx - sx}px, ${ty - sy}px) scale(0.45)`;
      fly.style.opacity = "0.2";
    }));
    setTimeout(() => {
      fly.remove();
      try { musicBtn.classList.add("land"); setTimeout(() => musicBtn.classList.remove("land"), 420); } catch (e) {}
      if (done) done();
    }, 950);
  }

  // -------------------------------------------------------------- HUB
  function renderHub(opts) {
    currentScreen = "hub";
    stopChapterAudio();   // leaving a chapter -> back to the global background song
    renderProgress();
    showProgress(true);
    const scene = el("div", "scene hub-scene");
    const head = el("div", "hub-head");
    head.appendChild(el("h2", "title", CONFIG.hub.title || "Pick a star"));
    head.appendChild(el("p", "subtitle", CONFIG.hub.subtitle || ""));
    // a little Krishna flute, with notes drifting out (she loves Krishna)
    const flute = el("div", "krishna-flute");
    flute.innerHTML =
      `<svg viewBox="0 0 150 40" aria-hidden="true">` +
        `<defs><linearGradient id="flt" x1="0" y1="0" x2="0" y2="1">` +
          `<stop offset="0" stop-color="#e6cc93"/><stop offset="0.5" stop-color="#c9a86a"/><stop offset="1" stop-color="#a9833f"/>` +
        `</linearGradient></defs>` +
        `<rect x="6" y="15" width="138" height="11" rx="5.5" fill="url(#flt)" stroke="rgba(90,66,30,0.5)" stroke-width="1"/>` +
        `<rect x="42" y="14" width="3" height="13" rx="1.5" fill="rgba(90,66,30,0.45)"/>` +
        `<rect x="96" y="14" width="3" height="13" rx="1.5" fill="rgba(90,66,30,0.45)"/>` +
        `<circle cx="20" cy="20.5" r="2.4" fill="rgba(60,40,15,0.75)"/>` +
        `<circle cx="60" cy="20.5" r="2.1" fill="rgba(60,40,15,0.75)"/>` +
        `<circle cx="72" cy="20.5" r="2.1" fill="rgba(60,40,15,0.75)"/>` +
        `<circle cx="84" cy="20.5" r="2.1" fill="rgba(60,40,15,0.75)"/>` +
        `<circle cx="114" cy="20.5" r="2.1" fill="rgba(60,40,15,0.75)"/>` +
        `<circle cx="126" cy="20.5" r="2.1" fill="rgba(60,40,15,0.75)"/>` +
      `</svg>` +
      `<span class="flute-note n1">♪</span>` +
      `<span class="flute-note n2">♫</span>` +
      `<span class="flute-note n3">♩</span>`;
    head.appendChild(flute);
    scene.appendChild(head);

    const map = el("div", "constellation-map");
    CONFIG.chapters.forEach((c, idx) => {
      const card = el("button", "constellation" + (seen.has(c.id) ? " seen" : ""));
      card.innerHTML = miniStarsSVG(idx);
      card.insertAdjacentHTML("beforeend", `<span class="chapter-num">Chapter ${idx + 1}</span>`);
      card.insertAdjacentHTML("beforeend", `<span class="card-icon">${c.icon || "✦"}</span>`);
      card.insertAdjacentHTML("beforeend", `<h3 class="card-title">${c.title || ""}</h3>`);
      card.insertAdjacentHTML("beforeend", `<p class="card-teaser">${c.teaser || ""}</p>`);
      card.addEventListener("click", () => renderChapter(c));
      map.appendChild(card);
    });
    scene.appendChild(map);

    const allSeen = CONFIG.devUnlockFinale || CONFIG.chapters.every((c) => seen.has(c.id));
    const finale = el("button", "finale-star" + (allSeen ? "" : " locked"));
    finale.innerHTML = `<h3 class="card-title">${allSeen ? CONFIG.hub.finaleUnlockedLabel : CONFIG.hub.finaleLockedLabel}</h3>`;
    if (allSeen) finale.addEventListener("click", renderWish);
    scene.appendChild(finale);

    swap(scene);
    // when returning after finishing a chapter, scroll to the end so the next
    // chapter + the finale button are in view (helps on tall mobile hubs)
    if (opts && opts.scrollEnd) {
      requestAnimationFrame(() => requestAnimationFrame(() => { stage.scrollTop = stage.scrollHeight; }));
    }
    // a butterfly flutters in and settles on the flute
    requestAnimationFrame(() => requestAnimationFrame(() => {
      setTimeout(() => butterflyRest(flute), 500);
    }));
  }

  // builds the parchment "offer letter" card
  function letterHTML(L) {
    L = L || {};
    const today = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    const company = fill(L.company) || `${CONFIG.herName} Rice Co.™`;
    let sign = fill(L.signature) || "Me";
    if (sign === "Me") sign = (CONFIG.yourName || "Me");
    const lines = (L.lines || []).map((x) => `<p>${fill(x)}</p>`).join("");
    return `
      <div class="letter-stamp">HIRED</div>
      <div class="letter-head">
        <span class="letter-logo">🌾</span>
        <div>
          <div class="letter-co">${company}</div>
          <div class="letter-tag">${fill(L.tagline) || "Fragrant rice. Questionable logistics."}</div>
        </div>
      </div>
      <div class="letter-title">${fill(L.heading) || "Letter of Employment"}</div>
      <div class="letter-body">${lines}</div>
      <div class="letter-foot">
        <div class="letter-date">${fill(L.date) || today}</div>
        <div class="letter-sign">${sign}<span class="sign-role">${fill(L.signRole) || ""}</span></div>
      </div>`;
  }

  // -------------------------------------------------------------- CHAPTER
  function renderChapter(chapter) {
    currentScreen = "chapter";
    let i = 0;
    if (chapter.songs && chapter.songs.length) {
      if (playlist !== chapter.songs) startChapterPlaylist(chapter.songs);   // stacked clips w/ skip button
    } else if (chapter.song) startChapterAudio(chapter.song, chapter.songLabel);   // single looping clip
    else stopChapterAudio();                                                // no clip -> global bg plays
    showProgress(true);

    const meterType = chapter.meter;            // "rice" | "bloom" | undefined
    let fillFrom = 0;                            // last meter level (persists across beats)
    let bagFill = null, bagPct = null;           // rice bag refs
    let bloomEl = null;                          // blooming flower ref
    let redFrom = 0;                             // red-thread progress (persists)
    let starFrom = 0;                            // constellation draw progress
    let moonFrom = 0;                            // moon phase progress

    // story flow: where this chapter sits, and what comes next
    const chIdx = CONFIG.chapters.indexOf(chapter);
    const isFinalChapter = chIdx === CONFIG.chapters.length - 1;
    const nextChapter = CONFIG.chapters[chIdx + 1];
    const advance = () => renderHub({ scrollEnd: true });   // back to the map, scrolled to the end

    function doUnlock(nowAllLit) {
      if (nowAllLit && !unlockedOnce) {
        unlockedOnce = true;
        try {
          // full-sky shower: stars streaking in from every side
          SKY.starShower(5500);
        } catch (e) { /* ignore */ }
      }
    }

    function complete() {
      seen.add(chapter.id);
      const nowAllLit = CONFIG.chapters.every((c) => seen.has(c.id));

      // rice chapter: top the bag off to 100% and pour it out, then move on
      if (meterType === "rice" && bagFill) {
        bagFill.style.height = "100%";
        if (bagPct) bagPct.textContent = "100%";
        try {
          const r = bagFill.getBoundingClientRect();
          SKY.riceBurst(r.left + r.width / 2, r.top, 110);
          SKY.shootingStar();
        } catch (e) { /* ignore */ }
        doUnlock(nowAllLit);
        setTimeout(advance, 1050);
        return;
      }

      // bloom chapter: open the flower fully, then move on
      if (meterType === "bloom" && bloomEl) {
        bloomEl.style.setProperty("--b", "1");
        try {
          const r = bloomEl.getBoundingClientRect();
          SKY.stardustBurst(r.left + r.width / 2, r.top + r.height / 2, palette);
          SKY.shootingStar();
        } catch (e) { /* ignore */ }
        doUnlock(nowAllLit);
        setTimeout(advance, 1050);
        return;
      }

      try {
        if (chapter.burst === "rice" && SKY.riceBurst) SKY.riceBurst(cx(), cy() * 0.7);
        else SKY.stardustBurst(cx(), cy() * 0.8, palette);
        SKY.shootingStar();
      } catch (e) { /* ignore */ }
      doUnlock(nowAllLit);
      setTimeout(advance, 900);   // let the burst land, then flow to the next chapter
    }

    function renderBeat() {
      const beat = chapter.beats[i];
      const type = beat.type || "text";
      const isLast = i === chapter.beats.length - 1;
      const scene = el("div", "scene" + (chapter.skyShow ? " sky-scene" : ""));

      const dots = el("div", "beat-dots");
      chapter.beats.forEach((_, idx) => {
        const d = el("i");
        if (idx <= i) d.classList.add("on");
        dots.appendChild(d);
      });
      scene.appendChild(dots);

      // builds the rice-bag meter (mounted BELOW the text, just above the buttons)
      function mountRiceBag() {
        const target = Math.round(((i + 1) / chapter.beats.length) * 90);
        const bag = el("div", "rice-bag");
        bag.innerHTML =
          `<div class="rice-sack">` +
            `<div class="rice-tie"></div>` +
            `<div class="rice-body"><div class="rice-fill"></div></div>` +
          `</div>` +
          `<div class="rice-label">🌾 stock <span class="rice-pct">${fillFrom}%</span></div>`;
        scene.appendChild(bag);
        bagFill = bag.querySelector(".rice-fill");
        bagPct = bag.querySelector(".rice-pct");
        bagFill.style.height = fillFrom + "%";       // start from where we were
        const increasing = target > fillFrom;
        requestAnimationFrame(() => requestAnimationFrame(() => {
          bagFill.style.height = target + "%";       // animate to the new level
          if (bagPct) bagPct.textContent = target + "%";
          if (increasing) {
            try {
              const b = bag.querySelector(".rice-body").getBoundingClientRect();
              SKY.riceBurst(b.left + b.width / 2, b.top + 6, 16);  // gentle sprinkle
            } catch (e) { /* ignore */ }
          }
        }));
        fillFrom = target;
      }

      // builds the blooming flower (opens a little more each beat)
      function mountBloom() {
        const target = Math.min(1, (i + 1) / chapter.beats.length);
        const flower = el("div", "bloom-flower");
        flower.innerHTML = flowerSVG();
        flower.style.setProperty("--b", String(fillFrom));
        scene.appendChild(flower);
        bloomEl = flower;
        const increasing = target > fillFrom;
        requestAnimationFrame(() => requestAnimationFrame(() => {
          flower.style.setProperty("--b", String(target));
          if (increasing) {
            try {
              const r = flower.getBoundingClientRect();
              SKY.stardustBurst(r.left + r.width / 2, r.top + r.height / 2, palette);
            } catch (e) { /* ignore */ }
          }
        }));
        fillFrom = target;
      }

      // wraps a subtle red thread AROUND the text box, cinching more each beat
      // subtle red thread below the text, drawing a little further each beat
      function mountRedThread() {
        const target = (i + 1) / chapter.beats.length;
        const t = el("div", "red-thread");
        t.innerHTML =
          `<svg viewBox="0 0 320 70" preserveAspectRatio="none" aria-hidden="true">` +
            `<path d="M12,52 C70,8 128,62 180,32 S276,10 308,42" pathLength="100" ` +
            `fill="none" stroke="#d94459" stroke-width="1.6" stroke-linecap="round" ` +
            `style="stroke-dasharray:100; stroke-dashoffset:${100 - redFrom * 100};"/>` +
          `</svg>`;
        scene.appendChild(t);
        const path = t.querySelector("path");
        requestAnimationFrame(() => requestAnimationFrame(() => {
          path.style.transition = "stroke-dashoffset .95s ease";
          path.style.strokeDashoffset = String(100 - target * 100);
        }));
        redFrom = target;
      }

      // ==== Tab 3 "You & the sky" decorations (all three, to compare) ========

      // (a) moon phase: waxes from crescent toward full as she reads
      function mountMoonPhase() {
        const target = (i + 1) / chapter.beats.length;
        const m = el("div", "sky-moon");
        m.innerHTML =
          `<svg viewBox="0 0 64 64" aria-hidden="true">` +
            `<defs><radialGradient id="mlit" cx="42%" cy="38%" r="65%">` +
              `<stop offset="0%" stop-color="#fffdf5"/><stop offset="60%" stop-color="#f3ecd2"/><stop offset="100%" stop-color="#d9cfa6"/>` +
            `</radialGradient></defs>` +
            `<circle cx="32" cy="32" r="26" fill="url(#mlit)"/>` +
            `<circle class="mshadow" cx="32" cy="32" r="26" fill="#0c0c22"/>` +
          `</svg>`;
        m.style.setProperty("--ph", String(moonFrom));
        scene.insertBefore(m, scene.firstChild);
        requestAnimationFrame(() => requestAnimationFrame(() => { m.style.setProperty("--ph", String(target)); }));
        moonFrom = target;
      }

      // (b) self-drawing constellation below the text
      function mountConstellation() {
        const target = (i + 1) / chapter.beats.length;
        const pts = [[16, 62], [54, 28], [96, 56], [138, 24], [176, 50], [150, 82]];
        const litCount = Math.round(target * (pts.length - 1)) + 1;
        let dotsSvg = "";
        for (let j = 0; j < pts.length; j++) {
          const lit = j < litCount;
          dotsSvg += `<circle cx="${pts[j][0]}" cy="${pts[j][1]}" r="${lit ? 3 : 1.6}" ` +
            `fill="${lit ? "#ffe9b0" : "#8aa2d6"}" opacity="${lit ? 1 : 0.5}" ` +
            `${lit ? 'style="filter:drop-shadow(0 0 5px #ffd884)"' : ""}/>`;
        }
        let d = "M" + pts[0][0] + "," + pts[0][1];
        for (let j = 1; j < pts.length; j++) d += " L" + pts[j][0] + "," + pts[j][1];
        const wrap = el("div", "sky-constel");
        wrap.innerHTML =
          `<svg viewBox="0 0 200 96" aria-hidden="true">` +
            `<path d="${d}" fill="none" stroke="#ffe9b0" stroke-width="1.4" stroke-linecap="round" pathLength="100" ` +
            `style="stroke-dasharray:100; stroke-dashoffset:${100 - starFrom * 100}; filter:drop-shadow(0 0 4px rgba(255,216,132,0.6))"/>` +
            dotsSvg +
          `</svg>`;
        scene.appendChild(wrap);
        const path = wrap.querySelector("path");
        requestAnimationFrame(() => requestAnimationFrame(() => {
          path.style.transition = "stroke-dashoffset 1s ease";
          path.style.strokeDashoffset = String(100 - target * 100);
        }));
        starFrom = target;
      }

      const row = el("div", "btn-row");
      const next = el("button", "btn");
      const goNext = () => { if (isLast) complete(); else { i++; swap(renderBeat()); } };
      next.addEventListener("click", goNext);

      // ---- beat body by type ----
      if (type === "choice") {
        if (beat.note) scene.appendChild(el("p", "beat-note", fill(beat.note)));
        scene.appendChild(el("p", "beat-text", fill(beat.prompt || beat.text || "")));
        const opts = el("div", "choice-opts");
        const reply = el("p", "choice-reply");
        (beat.options || []).forEach((o) => {
          const b = el("button", "choice-opt", fill(o.label));
          b.addEventListener("click", () => {
            opts.querySelectorAll(".choice-opt").forEach((x) => x.classList.remove("chosen"));
            b.classList.add("chosen");
            reply.classList.remove("show");
            void reply.offsetWidth;              // restart the fade so it re-animates
            reply.textContent = fill(o.reply || "");
            reply.classList.add("show");
            next.style.visibility = "visible";
          });
          opts.appendChild(b);
        });
        scene.appendChild(opts);
        scene.appendChild(reply);
        next.textContent = isLast ? (beat.button || "Light it ✷") : (beat.button || "Next →");
        next.style.visibility = "hidden"; // reveal after she answers
      } else if (type === "letter") {
        const card = el("div", "offer-letter");
        card.innerHTML = letterHTML(beat.letter);
        scene.appendChild(card);
        next.textContent = beat.button || "Accept & sign ✍️";
      } else {
        if (beat.title) scene.appendChild(el("p", "beat-title", fill(beat.title)));
        if (beat.note) scene.appendChild(el("p", "beat-note", fill(beat.note)));
        scene.appendChild(el("p", "beat-text", fill(beat.text || "")));
        next.textContent = isLast ? (beat.button || "Light it ✷") : (beat.button || "Next →");
      }

      // decorations sit below the text, above the buttons
      if (chapter.decor === "redstring") mountRedThread();
      if (meterType === "rice") mountRiceBag();
      else if (meterType === "bloom") mountBloom();
      if (chapter.skyShow) { mountMoonPhase(); mountConstellation(); }

      const back = el("button", "btn ghost", i === 0 ? "← Sky" : "← Back");
      back.addEventListener("click", () => {
        if (i === 0) renderHub();
        else { i--; swap(renderBeat()); }
      });
      row.appendChild(back);
      row.appendChild(next);
      scene.appendChild(row);
      return scene;
    }
    swap(renderBeat());
  }

  // -------------------------------------------------------------- MAKE A WISH
  function renderWish() {
    currentScreen = "wish";
    showProgress(false);
    // start the Dearest Mahii song(s) here so they're well underway by the message
    if (CONFIG.finale.songs && CONFIG.finale.songs.length) {
      if (playlist !== CONFIG.finale.songs) startChapterPlaylist(CONFIG.finale.songs);
    } else if (CONFIG.finale.song && currentChapterSong !== CONFIG.finale.song) {
      startChapterAudio(CONFIG.finale.song, CONFIG.finale.songLabel);
    }
    const w = (CONFIG.wish) || {};
    const scene = el("div", "scene wish-scene");
    scene.appendChild(el("p", "kicker", w.kicker || "the whole sky is lit ✷"));
    scene.appendChild(el("h2", "title", w.title || "Now, make a wish"));
    scene.appendChild(el("p", "subtitle", w.subtitle || "Catch the shooting star to send it up."));

    // the tappable shooting star
    const stage2 = el("div", "wish-field");

    // soft glowing blue stars scattered around the wish
    const blue = el("div", "blue-stars");
    for (let k = 0; k < 16; k++) {
      const s = el("span", "blue-star", "☆");
      s.style.left = (5 + Math.random() * 90).toFixed(1) + "%";
      s.style.top = (5 + Math.random() * 90).toFixed(1) + "%";
      s.style.fontSize = (12 + Math.random() * 26).toFixed(0) + "px";
      s.style.animationDelay = (Math.random() * 3).toFixed(2) + "s";
      s.style.animationDuration = (3 + Math.random() * 3).toFixed(2) + "s";
      blue.appendChild(s);
    }
    stage2.appendChild(blue);

    const star = el("button", "wish-star", "✦");
    star.setAttribute("aria-label", "Make a wish");
    stage2.appendChild(star);
    scene.appendChild(stage2);

    const hint = el("p", "wish-hint", w.hint || "(tap the star)");
    scene.appendChild(hint);

    let used = false;
    const grant = () => {
      if (used) return;
      used = true;
      star.classList.add("granted");
      const r = star.getBoundingClientRect();
      try {
        SKY.stardustBurst(r.left + r.width / 2, r.top + r.height / 2, palette);
        SKY.shootingStar();
      } catch (e) { /* ignore */ }
      hint.textContent = w.granted || "made. ✷";
      setTimeout(renderFinale, 2600);   // let her read the "it's on its way" line first
    };
    star.addEventListener("click", grant);
    star.addEventListener("touchstart", (e) => { e.preventDefault(); grant(); }, { passive: false });

    swap(scene);
  }

  // -------------------------------------------------------------- FINALE
  function renderFinale() {
    currentScreen = "finale";
    showProgress(false);
    // continue the song(s) already started on the wish screen; only start if needed
    if (CONFIG.finale.songs && CONFIG.finale.songs.length) {
      if (playlist !== CONFIG.finale.songs) startChapterPlaylist(CONFIG.finale.songs);
    } else if (CONFIG.finale.song) {
      if (currentChapterSong !== CONFIG.finale.song) startChapterAudio(CONFIG.finale.song, CONFIG.finale.songLabel);
    } else if (!musicReady) startMusicIfPossible();

    const scene = el("div", "scene finale-scene");
    const head = el("div", "finale-head");
    head.appendChild(el("h1", "title", `${fill(CONFIG.finale.title)} <span class="name">${fill(CONFIG.finale.nameDisplay || CONFIG.herName)}</span>`));
    scene.appendChild(head);

    const linesWrap = el("div", "finale-lines");
    const lineEls = CONFIG.finale.lines.map((txt) => {
      const p = el("p", "finale-line", fill(txt));
      linesWrap.appendChild(p);
      return p;
    });
    const sign = CONFIG.finale.signoff ? el("p", "finale-signoff", finaleSignoff()) : null;
    if (sign) linesWrap.appendChild(sign);

    // optional self-aware P.S. ("yes, this is too much" — her running line)
    const psEl = CONFIG.finale.ps ? el("p", "finale-ps", fill(CONFIG.finale.ps)) : null;
    if (psEl) linesWrap.appendChild(psEl);

    scene.appendChild(linesWrap);

    const row = el("div", "btn-row");
    const moreBtn = el("button", "btn more-btn", CONFIG.finale.moreLabel || "wait... there's more ✨");
    if (CONFIG.devUnlockFinale) { moreBtn.style.visibility = "visible"; moreBtn.classList.add("pop-in"); }
    else moreBtn.style.visibility = "hidden";
    moreBtn.addEventListener("click", () => { try { SKY.unlockAudio && SKY.unlockAudio(); } catch (e) {} renderGrandFinale(); });
    row.appendChild(moreBtn);
    scene.appendChild(row);

    swap(scene);
    mountGarden();   // the garden grows behind the message (replaces the static sunflowers)

    // the sky celebrates
    const lanternCount = (CONFIG.theme && CONFIG.theme.lanternCount) || 12;
    SKY.launchFloaters(lanternCount, "lantern", null, true);   // auto-cleaning stream
    SKY.stardustBurst(cx(), cy() * 0.6, palette);
    // keep a gentle stream of lanterns rising for as long as she's on this page
    finaleLanternTimer = setInterval(() => { try { SKY.launchFloaters(2, "lantern", null, true); } catch (e) {} }, 2800);

    // flowers-project sequence: let the garden bloom first, THEN fade in the
    // focus veil and bring the message up over it
    const GARDEN_BLOOM = 11800;
    // once the garden has bloomed, darken the whole screen (uneven, centre-weighted),
    // then bring the message up over it
    const focus = document.createElement("div");
    focus.className = "finale-focus";
    document.body.appendChild(focus);
    setTimeout(() => focus.classList.add("show"), GARDEN_BLOOM - 900);
    lineEls.forEach((p, idx) => setTimeout(() => p.classList.add("show"), GARDEN_BLOOM + idx * 1100));
    const signAt = GARDEN_BLOOM + 200 + lineEls.length * 1100;
    if (sign) setTimeout(() => sign.classList.add("show"), signAt);
    let revealMoreAt = signAt + 900;
    if (psEl) {
      setTimeout(() => psEl.classList.add("show"), signAt + 1200);
      revealMoreAt = signAt + 1200 + 1000;
    }
    setTimeout(() => { moreBtn.style.visibility = "visible"; moreBtn.classList.add("pop-in"); }, revealMoreAt);
  }

  // -------------------------------------------------------------- GRAND FINALE
  function renderGrandFinale() {
    currentScreen = "grand";
    showProgress(false);
    startGrandMusic();   // soft instrumental under the fireworks (or silence if none set)
    const g = CONFIG.grandFinale || {};
    const scene = el("div", "scene finale-scene grand-scene");
    const head = el("div", "finale-head");
    if (g.kicker) head.appendChild(el("p", "kicker", fill(g.kicker)));
    head.appendChild(el("h1", "title", `${fill(g.title) || "Happy Birthday"} 🎂`));
    scene.appendChild(head);

    // messages: an array of line-sets, one per celebration (balloons -> stars ->
    // lanterns -> swarm). Falls back to the old single `lines` if `messages` absent.
    const MESSAGES = (g.messages && g.messages.length) ? g.messages : [g.lines || []];
    const linesWrap = el("div", "finale-lines");
    scene.appendChild(linesWrap);
    let signTxt = null;
    if (g.signoff) signTxt = g.signoff === "Me" ? (CONFIG.yourName || "Me") : fill(g.signoff);
    let lineEls = [];
    let sign = null;
    // (re)build the message block for a given celebration index
    function buildLines(idx) {
      linesWrap.innerHTML = "";
      const set = MESSAGES[idx % MESSAGES.length] || [];
      lineEls = set.map((t) => {
        const p = el("p", "finale-line", fill(t));
        linesWrap.appendChild(p);
        return p;
      });
      sign = signTxt ? el("p", "finale-signoff", signTxt) : null;
      if (sign) linesWrap.appendChild(sign);
    }
    buildLines(0);

    const row = el("div", "btn-row");
    const againBtn = el("button", "btn celebrate-btn", (CONFIG.grandFinale && CONFIG.grandFinale.againLabel) || "🎉 Celebrate again");
    const replay = el("button", "btn ghost", CONFIG.finale.replayLabel || "↺ Watch the sky again");
    replay.addEventListener("click", () => {
      try { SKY.clearLanterns(); } catch (e) { /* ignore */ }
      seen.clear();
      unlockedOnce = false;
      renderIntro();
      // coming back from the grand finale: audio is already unlocked, so bring the
      // hub song back on the intro page instead of waiting for "Open the sky"
      try { startMusicIfPossible(); } catch (e) { /* ignore */ }
    });
    row.appendChild(againBtn);
    row.appendChild(replay);
    row.style.visibility = "hidden";   // hidden until the name moment finishes
    scene.appendChild(row);

    // the full playlist, as a clearly-branded Spotify button (appears with the end buttons)
    let spotifyLink = null;
    if (g.spotify && g.spotify.url) {
      spotifyLink = document.createElement("a");
      spotifyLink.className = "spotify-link";
      spotifyLink.href = g.spotify.url;
      spotifyLink.target = "_blank";
      spotifyLink.rel = "noopener noreferrer";
      spotifyLink.innerHTML =
        '<svg class="sp-logo" viewBox="0 0 168 168" aria-hidden="true">' +
        '<path fill="#1ED760" d="M84 0C37.6 0 0 37.6 0 84s37.6 84 84 84 84-37.6 84-84S130.4 0 84 0z"/>' +
        '<path fill="#000" d="M122.4 121.1a5.2 5.2 0 01-7.2 1.7c-19.7-12-44.4-14.7-73.6-8.1a5.2 5.2 0 11-2.3-10.2c31.9-7.3 59.3-4.2 81.3 9.3a5.2 5.2 0 011.8 7.3zm10.2-22.8a6.5 6.5 0 01-9 2.2c-22.5-13.9-56.8-17.9-83.4-9.8a6.5 6.5 0 11-3.8-12.5c30.4-9.2 68.2-4.8 94.1 11.1a6.5 6.5 0 012.1 9zm.9-23.7C107.5 58.5 63 57 37.2 64.9a7.8 7.8 0 11-4.5-15C62.3 40.9 111.4 42.6 142.5 61a7.8 7.8 0 01-8.9 12.9z"/>' +
        '</svg>' +
        '<span class="sp-text">' + fill(g.spotify.label || "For Mahii") + '</span>';
      spotifyLink.style.visibility = "hidden";
      scene.appendChild(spotifyLink);
    }

    swap(scene);

    const shake = (ms) => {
      document.body.classList.add("shake");
      setTimeout(() => document.body.classList.remove("shake"), ms || 700);
    };

    // each celebration cycles a firework theme + a floating element (all grand)
    const SHOW_THEMES = [
      ["#ff5e7e", "#ffd166", "#7bdff2", "#c8a2ff", "#8affc1", "#ff9f68", "#ffffff"], // classic
      ["#7bdff2", "#5ad1ff", "#a8c7ff", "#c8a2ff", "#ffffff", "#8affc1"],            // cool blues
      ["#ff8ad1", "#c8a2ff", "#ffd166", "#ff9f68", "#ffffff"],                       // warm sunset
      ["#8affc1", "#7bdff2", "#a8ffcf", "#ffd166", "#ffffff"],                       // aurora
    ];
    const FLOATERS = ["balloon", "star", "lantern", "crane"];
    let cycle = 0;

    // small per-run jitter so no two shows feel identical — but scale stays the same
    const jit = (base, amt) => base + (Math.random() * 2 - 1) * amt;
    const jitI = (base, amt) => Math.max(1, Math.round(base + (Math.random() * 2 - 1) * amt));

    // reveals the message + buttons AFTER the star-name has had its moment
    function revealMessage() {
      lineEls.forEach((p, idx) => setTimeout(() => p.classList.add("show"), idx * 1000));
      const after = lineEls.length * 1000;
      if (sign) setTimeout(() => sign.classList.add("show"), after + 200);
      // buttons are NOT shown here — they appear only after the fireworks finish
    }

    // THE SHOW: everything, everywhere, all at once — replayable, always grand.
    // `long` (used only on the very first show) runs ~55s: gentle open, a steady
    // pleasant middle (spaced-out, never a mess), then the big barrage at the end.
    function bigShow(theme, floater, long) {
     try {
      const base = (CONFIG.theme && CONFIG.theme.lanternCount) || 14;

      if (long) {
        // ---- the long first show (~55s): same lively energy as the short show,
        //      just sustained — concurrent bursts, jitter, flashes throughout ----
        SKY.fireworksShow(38000, 2.4);     // full density, sustained for ~38s
        SKY.launchFloaters(jitI(base + 10, 2), floater);

        // floaters drift up steadily the whole way through
        let fl = 1600;
        const flTimes = [];
        while (fl < 36000) { flTimes.push(fl); fl += 1600; }
        flTimes.forEach((t) =>
          setTimeout(() => { try { SKY.launchFloaters(jitI(9, 2), floater); } catch (e) {} }, jit(t, 250)));

        // rolling peony clusters every ~1.6s across the show (no screen flashes)
        for (let t = 1500; t <= 35000; t += 1600) {
          setTimeout(() => { try { SKY.fireworkCluster(jitI(5, 1)); } catch (e) {} }, jit(t, 260));
        }
        // smaller single pops scattered in between for texture
        for (let t = 900; t <= 35000; t += 950) {
          setTimeout(() => { try { SKY.firework(); } catch (e) {} }, jit(t, 300));
        }
        // an occasional gentle screen shake + a soft flash on the bigger clusters
        [9000, 20000, 30000].forEach((t) =>
          setTimeout(() => { try { shake(jitI(380, 80)); SKY.flash(jit(0.14, 0.03)); } catch (e) {} }, jit(t, 300)));

        // a fuller finish with a shake + flash, held to the end
        [36000, 36800, 37600].forEach((t) =>
          setTimeout(() => { try { SKY.fireworkCluster(jitI(8, 2)); } catch (e) {} }, jit(t, 220)));
        setTimeout(() => {
          try { SKY.fireworkCluster(jitI(12, 2)); shake(jitI(650, 120)); SKY.flash(jit(0.26, 0.05)); SKY.launchFloaters(jitI(14, 2), floater); } catch (e) { /* ignore */ }
        }, jit(38000, 150));
        return;
      }

      // ---- the short replay show (~23s) — peonies, no screen flashes ----
      SKY.fireworksShow(20000, 2.4);        // dense, sustained fireworks
      SKY.launchFloaters(jitI(base + 10, 2), floater);
      [1600, 3200, 4800, 6400, 8000, 9600, 11200, 12800, 14400, 16000].forEach((t) =>
        setTimeout(() => { try { SKY.launchFloaters(jitI(9, 2), floater); } catch (e) {} }, jit(t, 250)));

      // rolling peony clusters through the show (no flashes)
      [1500, 3000, 4500, 6000, 7500, 9000, 10500, 12000, 13500, 15000].forEach((t) =>
        setTimeout(() => { try { SKY.fireworkCluster(jitI(5, 1)); } catch (e) {} }, jit(t, 220)));
      // smaller single pops in between for texture
      for (let t = 900; t <= 16000; t += 950) {
        setTimeout(() => { try { SKY.firework(); } catch (e) {} }, jit(t, 280));
      }
      // an occasional gentle shake + a soft flash
      [6000, 14000].forEach((t) => setTimeout(() => { try { shake(jitI(360, 70)); SKY.flash(jit(0.14, 0.03)); } catch (e) {} }, jit(t, 260)));

      // a fuller finish with a shake + flash, held to the end
      [17000, 17800, 18600].forEach((t) =>
        setTimeout(() => { try { SKY.fireworkCluster(jitI(8, 2)); } catch (e) {} }, jit(t, 200)));
      setTimeout(() => {
        try { SKY.fireworkCluster(jitI(12, 2)); shake(jitI(620, 110)); SKY.flash(jit(0.26, 0.05)); SKY.launchFloaters(jitI(14, 2), floater); } catch (e) { /* ignore */ }
      }, jit(20000, 150));
     } catch (e) { /* ignore */ }
    }

    function runShow() {
      const theme = SHOW_THEMES[cycle % SHOW_THEMES.length];
      const floater = FLOATERS[cycle % FLOATERS.length];
      buildLines(cycle);         // this celebration's own message (hidden until reveal)
      cycle++;
      try { SKY.setFireworkTheme(theme); SKY.setPalette(theme); } catch (e) { /* ignore */ }
      // message starts hidden (buildLines created fresh, un-shown lines)
      row.style.visibility = "hidden";
      if (spotifyLink) { spotifyLink.style.visibility = "hidden"; spotifyLink.classList.remove("pop-in"); }
      // her name forms hidden; a swarm of butterflies covers the centre, then
      // scatters to uncover "Mahii" in the stars, and the show erupts
      try { SKY.clearName(); SKY.nameInStars(CONFIG.herName, true); } catch (e) { /* ignore */ }
      const swarmCount = window.innerWidth <= 600 ? 40 : 220;   // phones get fewer so it stays smooth
      butterflyReveal(
        swarmCount,
        () => {   // name appears -> hold (song settles) -> golden shower -> then the big show
          try { SKY.showName(); } catch (e) { /* ignore */ }
          const firstShow = (cycle === 1);                            // the very first run is the long, gentle one
          const NAME_HOLD = 4000;                                     // let the name + song breathe before any firework
          const BIGSHOW_DELAY = NAME_HOLD + 3200;                     // gold shower, then let it own the sky
          const SHOW_LEN = firstShow ? 40000 : 23000;                 // first show ~40s; replays ~23s
          const SHOW_END = BIGSHOW_DELAY + SHOW_LEN;                  // buttons only after the fireworks finish
          setTimeout(() => { try { duckGrandMusic(); } catch (e) {} }, NAME_HOLD - 600);   // duck just before the booms
          setTimeout(() => { try { SKY.bigGoldFirework(); } catch (e) {} }, NAME_HOLD);   // first shot after the hold
          setTimeout(() => bigShow(theme, floater, firstShow), BIGSHOW_DELAY);
          setTimeout(() => { try { SKY.fadeName(); } catch (e) {} revealMessage(); }, BIGSHOW_DELAY + 900);
          // the two buttons appear only once the whole show has finished
          setTimeout(() => {
            row.style.visibility = "visible"; row.querySelector(".celebrate-btn") && row.classList.add("ready");
            if (spotifyLink) { spotifyLink.style.visibility = "visible"; spotifyLink.classList.add("pop-in"); }
            try { unduckGrandMusic(); } catch (e) { /* ignore */ }   // show over -> song back to the front
          }, SHOW_END);
        }
      );
    }

    againBtn.addEventListener("click", () => {
      try { SKY.unlockAudio && SKY.unlockAudio(); } catch (e) { /* ignore */ }
      try { SKY.clearLanterns(); } catch (e) { /* ignore */ }
      runShow();
    });
    // let the page-swap finish painting first, THEN start the swarm (avoids first-run jank)
    requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(() => {
      // only clear leftovers on phones (perf); desktop lets them keep drifting up
      if (window.innerWidth <= 600) { try { SKY.clearLanterns(); } catch (e) { /* ignore */ } }
      runShow();
    }, 300)));
  }

  // ---- browser Back button: stay in the app and step to the previous screen
  //      instead of leaving the page
  function backTargetFor(screen) {
    switch (screen) {
      case "grand":   return function () { renderFinale(); };
      case "finale":  return function () { renderHub({ scrollEnd: true }); };
      case "wish":    return function () { renderHub({ scrollEnd: true }); };
      case "chapter": return function () { renderHub({ scrollEnd: true }); };
      case "hub":     return function () { renderIntro(); };
      default:        return null;   // intro: nothing to go back to -> stay put
    }
  }
  function armBack() { try { history.pushState({ app: true }, ""); } catch (e) { /* ignore */ } }
  window.addEventListener("popstate", function () {
    const target = backTargetFor(currentScreen);
    armBack();                 // re-arm so the next Back press is caught too
    if (target) { try { target(); } catch (e) { /* ignore */ } }
  });

  // -------------------------------------------------------------- boot
  renderIntro();
  armBack();   // put one app entry in history so the first Back is trapped
})();
