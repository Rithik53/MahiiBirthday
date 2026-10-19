/* ===========================================================================
   SKY — the night-sky effects engine
   - a living, twinkling starfield (parallax layers) drawn continuously
   - shooting stars that streak now and then
   - stardust bursts (used when things are "lit up")
   - a meteor shower for the finale
   - floating sky lanterns you can tap to burst into stardust
   Exposes a global `SKY` object used by app.js.
   =========================================================================== */

const SKY = (() => {
  const canvas = document.getElementById("fx-canvas");
  const ctx = canvas.getContext("2d");
  const lanternLayer = document.getElementById("lantern-layer");

  const GOLD = ["#fff7d6", "#ffe9a8", "#ffd166", "#cfe8ff", "#a8c7ff", "#ffffff"];
  let palette = GOLD;

  let W = 0, H = 0, dpr = 1;
  let stars = [];
  let dust = [];        // stardust burst particles
  let shooters = [];    // active shooting stars
  let lanterns = [];
  let rockets = [];     // rising firework rockets
  let nameStars = [];   // stars that fly in to spell a name
  let nameAlpha = 1;    // global fade for the star-name
  const FIREWORK_COLORS = ["#ff5e7e", "#ffd166", "#7bdff2", "#c8a2ff", "#8affc1", "#ff9f68", "#ffffff", "#5ad1ff", "#ff8ad1"];
  let fwColors = FIREWORK_COLORS.slice();   // current firework theme (cycled by app)
  function setFireworkTheme(arr) { fwColors = (arr && arr.length) ? arr.slice() : FIREWORK_COLORS.slice(); }
  let lastShooterAt = 0;
  let shooterEvery = 1100;   // ms between ambient shooting stars (jittered)
  let meteorMode = false;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildStars();
  }

  function buildStars() {
    // density scales with screen area, capped so phones stay smooth
    const count = Math.min(240, Math.round((W * H) / 6500));
    stars = [];
    for (let i = 0; i < count; i++) {
      const layer = Math.random();            // 0..1 depth
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.4 + layer * 1.6,
        base: 0.35 + Math.random() * 0.5,     // base brightness
        tw: Math.random() * Math.PI * 2,       // twinkle phase
        tws: 0.008 + Math.random() * 0.02,     // twinkle speed
        drift: 0.02 + layer * 0.06,            // slow horizontal drift
        hue: Math.random() > 0.85 ? "#cfe8ff" : "#ffffff",
      });
    }
  }

  // ---------------------------------------------------------------- shooting
  // anyDir=true -> spawn from a random edge and streak in a varied direction,
  // so a shower fills the whole sky instead of always going left-to-right.
  function launchShooter(fromFinale, anyDir) {
    let startX, startY, angle;
    if (anyDir) {
      const edge = Math.random();
      if (edge < 0.5) {                 // from the top, spreading both ways
        startX = Math.random() * W; startY = -20;
        angle = Math.PI * (0.15 + Math.random() * 0.7);   // down-left..down-right
      } else if (edge < 0.75) {         // from the left, heading down-right
        startX = -20; startY = Math.random() * H * 0.6;
        angle = Math.PI * (0.12 + Math.random() * 0.38);
      } else {                          // from the right, heading down-left
        startX = W + 20; startY = Math.random() * H * 0.6;
        angle = Math.PI * (0.5 + Math.random() * 0.38);
      }
    } else {
      startX = Math.random() * W * 0.7;
      startY = Math.random() * H * 0.35;
      angle = Math.PI / 5 + (Math.random() - 0.5) * 0.3; // gentle down-right
    }
    const speed = 9 + Math.random() * 6;
    shooters.push({
      x: startX, y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      len: 90 + Math.random() * 80,
      life: 1,
      bright: fromFinale ? 1 : 0.85,
    });
  }

  function shootingStar() { launchShooter(false); }

  // a full-sky shower: shooting stars raining in from every side
  function starShower(durationMs) {
    const end = Date.now() + (durationMs || 4000);
    (function drop() {
      const bursts = 2 + ((Math.random() * 3) | 0);
      for (let k = 0; k < bursts; k++) launchShooter(true, true);
      if (Date.now() < end) setTimeout(drop, 170);
    })();
  }

  // ---------------------------------------------------------------- fireworks
  const GOLD_BURST = ["#fff6d0", "#ffe9a8", "#ffd166", "#ffc24d", "#ffffff"];
  function explode(x, y, color, big) {
    if (dust.length > 2400) { boom(); return; }   // safety cap for weaker devices
    const n = big ? 180 : (62 + ((Math.random() * 46) | 0));
    const spMax = big ? 11 : 6.5;
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 1 + Math.random() * spMax;
      dust.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        r: (big ? 1.8 : 1.4) + Math.random() * (big ? 2.8 : 2.1),
        life: (big ? 72 : 55) + Math.random() * (big ? 60 : 50),
        max: big ? 135 : 105,
        color: big ? GOLD_BURST[(Math.random() * GOLD_BURST.length) | 0] : (Math.random() < 0.16 ? "#ffffff" : color),
        tw: Math.random() * Math.PI * 2,
        shape: "dot", rot: 0, vr: 0,
      });
    }
    // bright fast core for a punchier flash
    const coreN = big ? 30 : 14;
    for (let k = 0; k < coreN; k++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 4 + Math.random() * (big ? 7 : 4.5);
      dust.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        r: big ? 2.3 : 1.7, life: (big ? 34 : 28) + Math.random() * 20, max: big ? 56 : 48,
        color: "#ffffff", tw: 0, shape: "dot", rot: 0, vr: 0,
      });
    }
    if (big) flash(0.5);
    boom();
  }

  // a peony/willow burst: evenly-spread sparks that fly out, then droop with
  // gravity, each drawn as a long glowing trail (the look in the reference photo)
  // palette of rich firework tints (plus the gold set) for varied peonies
  const PEONY_TINTS = [
    ["#fff6d0", "#ffe9a8", "#ffd166", "#ffc24d"],   // gold
    ["#ffd1e6", "#ff8ad1", "#ff5e9c", "#ffffff"],   // pink
    ["#cfe4ff", "#8ab6ff", "#5a8dff", "#ffffff"],   // blue
    ["#d9ffe4", "#8affc1", "#48e39b", "#ffffff"],   // green
    ["#e8d6ff", "#c8a2ff", "#9a6bff", "#ffffff"],   // violet
    ["#ffe3c4", "#ffb067", "#ff8a3d", "#ffffff"],   // amber
  ];
  function explodePeony(x, y, tint) {
    if (dust.length > 2600) { boom(); return; }
    const pal = tint || PEONY_TINTS[(Math.random() * PEONY_TINTS.length) | 0];
    const rings = 2 + ((Math.random() * 2) | 0);   // 2-3 concentric rings for density
    for (let ring = 0; ring < rings; ring++) {
      const n = 48 + ring * 16;
      const base = Math.random() * Math.PI * 2;      // random rotation per ring
      const sp = (3.4 + ring * 1.8) + Math.random() * 1.4;   // outer rings fly faster
      for (let k = 0; k < n; k++) {
        const a = base + (k / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.05;
        const s = sp * (0.9 + Math.random() * 0.2);
        dust.push({
          x, y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s,
          r: 1.3 + Math.random() * 1.1,
          life: 130 + Math.random() * 80,   // longer -> long drooping trails
          max: 220,
          color: Math.random() < 0.1 ? "#ffffff" : pal[(Math.random() * pal.length) | 0],
          tw: Math.random() * Math.PI * 2,
          shape: "streak",
          grav: 0.1,            // droop so trails curve downward like a willow
          drag: 0.95,           // air resistance -> sparks slow and the shape fills out
          rot: 0, vr: 0,
        });
      }
    }
    // a hot bright core at the burst point (short-lived, no screen flash)
    for (let k = 0; k < 18; k++) {
      const a = Math.random() * Math.PI * 2, s = 1 + Math.random() * 2.6;
      dust.push({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        r: 1.7, life: 18 + Math.random() * 14, max: 32,
        color: pal[0], tw: 0, shape: "dot", grav: 0.04, rot: 0, vr: 0,
      });
    }
    boom();
  }

  function firework(x, y) {
    const sx = x != null ? x : (0.15 + Math.random() * 0.7) * W;
    // random burst height across the whole upper sky: some right near the top,
    // some mid-sky — spread so the top layer isn't empty
    const r = Math.random();
    const ty = y != null ? y
      : (r < 0.4 ? (0.04 + Math.random() * 0.12)      // top band
        : r < 0.75 ? (0.16 + Math.random() * 0.16)    // upper-mid
        : (0.32 + Math.random() * 0.16)) * H;         // mid
    rockets.push({ x: sx, y: H + 10, vy: -(9.5 + Math.random() * 3), ty, peony: true });
  }

  // a huge golden shower that fills the sky and rains down for a few seconds
  function explodeShower(x, y) {
    boom();
    const n = 380;
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 2 + Math.random() * 13.5;          // wide spread -> covers the screen
      dust.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 2,                    // slight upward bias, then gravity drapes it (willow)
        r: 1.4 + Math.random() * 2.2,
        life: 160 + Math.random() * 130,             // long -> lingers / rains for a few seconds
        max: 290,
        color: GOLD_BURST[(Math.random() * GOLD_BURST.length) | 0],
        tw: Math.random() * Math.PI * 2,
        shape: "dot", rot: 0, vr: 0,
      });
    }
  }

  // one single rocket that climbs high, then bursts into a full-sky golden shower
  function bigGoldFirework() {
    const sx = W / 2 + (Math.random() * 2 - 1) * W * 0.06;
    rockets.push({ x: sx, y: H + 10, vy: -(10.6 + Math.random() * 0.8), ty: H * 0.24, shower: true });
  }

  function fireworksShow(durationMs, intensity) {
    const boost = intensity || 1;
    const end = Date.now() + (durationMs || 6000);
    (function launch() {
      const shots = 1 + Math.round(Math.random() * boost);
      for (let s = 0; s < shots; s++) firework();
      if (Date.now() < end) setTimeout(launch, Math.max(110, (360 + Math.random() * 300) / boost));
    })();
  }

  // brief white flash over the whole screen (for big cluster hits)
  let flashEl = null;
  function flash(strength) {
    try {
      if (!flashEl) {
        flashEl = document.createElement("div");
        flashEl.style.cssText =
          "position:fixed;inset:0;z-index:7;pointer-events:none;background:#fff;opacity:0;";
        document.body.appendChild(flashEl);
      }
      flashEl.style.transition = "none";
      flashEl.style.opacity = String(Math.min(0.65, strength || 0.35));
      requestAnimationFrame(() => requestAnimationFrame(() => {
        flashEl.style.transition = "opacity .5s ease";
        flashEl.style.opacity = "0";
      }));
    } catch (e) { /* ignore */ }
  }

  // a big simultaneous burst of fireworks for the grand ending
  function fireworkCluster(count) {
    const n = count || 8;
    for (let k = 0; k < n; k++) setTimeout(firework, k * 80);
  }

  // ---------------------------------------------------------------- name in the stars
  // samples the text into points, then flies stars in to form it
  function nameInStars(text, hidden) {
    if (!text) return;
    const font = (px) => `700 ${px}px Fredoka, "Segoe UI", system-ui, sans-serif`;
    const targetW = Math.min(W * 0.82, 620);
    const oc = document.createElement("canvas");
    const octx = oc.getContext("2d");
    let fs = 200;
    octx.font = font(fs);
    let tw = octx.measureText(text).width || 1;
    fs = Math.max(56, Math.min(fs * (targetW / tw), 240));
    octx.font = font(fs);
    tw = octx.measureText(text).width;
    oc.width = Math.ceil(tw + 24);
    oc.height = Math.ceil(fs * 1.4);
    octx.font = font(fs);
    octx.fillStyle = "#fff";
    octx.textBaseline = "middle";
    octx.fillText(text, 12, oc.height / 2);
    const data = octx.getImageData(0, 0, oc.width, oc.height).data;
    const gap = Math.max(5, Math.round(fs / 20));
    const pts = [];
    for (let y = 0; y < oc.height; y += gap) {
      for (let x = 0; x < oc.width; x += gap) {
        if (data[(y * oc.width + x) * 4 + 3] > 130) pts.push([x, y]);
      }
    }
    const offX = (W - oc.width) / 2;
    const offY = H * 0.40 - oc.height / 2;
    nameAlpha = hidden ? 0 : 1;
    nameStars = pts.map(([px, py]) => ({
      tx: offX + px, ty: offY + py,
      x: Math.random() * W, y: H + Math.random() * H * 0.4,
      r: 1.2 + Math.random() * 1.5,
      tw: Math.random() * Math.PI * 2,
    }));
  }
  function clearName() { nameStars = []; nameAlpha = 1; }
  function showName() {
    (function step() {
      nameAlpha += 0.04;
      if (nameAlpha < 1) requestAnimationFrame(step);
      else nameAlpha = 1;
    })();
  }
  // gentle, slow fade — ~2.5s for the full fade so "Mahii" lingers before it goes
  function fadeName() {
    (function step() {
      nameAlpha -= 0.0067;   // ~2.5s at 60fps
      if (nameAlpha <= 0) { nameAlpha = 0; nameStars = []; }
      else requestAnimationFrame(step);
    })();
  }

  // ---------------------------------------------------------------- stardust
  function stardustBurst(x, y, colors) {
    const cols = colors || palette;
    const n = 34;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 1.5 + Math.random() * 5.5;
      dust.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 1.2,
        r: 1 + Math.random() * 2.4,
        life: 60 + Math.random() * 40,
        max: 100,
        color: cols[(Math.random() * cols.length) | 0],
        tw: Math.random() * Math.PI * 2,
        shape: "dot",
        rot: 0, vr: 0,
      });
    }
  }

  // a shower of little rice grains (used when the Rice Empire is founded 🌾)
  // count is optional — use a small count for a gentle per-step sprinkle
  function riceBurst(x, y, count) {
    const grains = ["#fbf3dc", "#fff8e4", "#f4ead0", "#efe0b8", "#ffffff"];
    const n = count || 70;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1; // up + out
      const sp = 3 + Math.random() * 8;
      dust.push({
        x: x + (Math.random() - 0.5) * 40,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 2,
        r: 3.5 + Math.random() * 3,        // grain length
        life: 80 + Math.random() * 50,
        max: 130,
        color: grains[(Math.random() * grains.length) | 0],
        tw: Math.random() * Math.PI * 2,
        shape: "grain",
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.4,
      });
    }
  }

  function meteorShower(durationMs) {
    meteorMode = true;
    shooterEvery = 650;
    const end = Date.now() + (durationMs || 4000);
    (function keep() {
      if (Date.now() < end) {
        setTimeout(keep, 400);
      } else {
        meteorMode = false;
        shooterEvery = 1100;
      }
    })();
  }

  // ---------------------------------------------------------------- render
  function draw(now) {
    ctx.clearRect(0, 0, W, H);

    // stars
    for (const s of stars) {
      s.tw += s.tws;
      const a = s.base + Math.sin(s.tw) * 0.35;
      s.x += s.drift * 0.15;
      if (s.x > W + 2) s.x = -2;
      ctx.globalAlpha = Math.max(0.05, Math.min(1, a));
      ctx.fillStyle = s.hue;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      // occasional sparkle cross on the brighter stars
      if (s.r > 1.3 && a > 0.75) {
        ctx.globalAlpha = (a - 0.75) * 1.5;
        ctx.strokeStyle = s.hue;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(s.x - s.r * 2.6, s.y);
        ctx.lineTo(s.x + s.r * 2.6, s.y);
        ctx.moveTo(s.x, s.y - s.r * 2.6);
        ctx.lineTo(s.x, s.y + s.r * 2.6);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    // ambient shooting stars — frequent, with a little timing + direction variety
    if (now - lastShooterAt > shooterEvery) {
      lastShooterAt = now;
      if (meteorMode) {
        launchShooter(true, true);
      } else {
        launchShooter(false, Math.random() < 0.35);  // most straight, some from other sides
        if (Math.random() < 0.25) launchShooter(false, true); // occasional second one
      }
      shooterEvery = 700 + Math.random() * 900;       // jitter so they aren't metronomic
    }

    // shooting stars
    for (let i = shooters.length - 1; i >= 0; i--) {
      const sh = shooters[i];
      sh.x += sh.vx;
      sh.y += sh.vy;
      sh.life -= 0.012;
      const tailX = sh.x - sh.vx * (sh.len / 10);
      const tailY = sh.y - sh.vy * (sh.len / 10);
      const grad = ctx.createLinearGradient(sh.x, sh.y, tailX, tailY);
      grad.addColorStop(0, `rgba(255,255,255,${sh.bright * sh.life})`);
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(sh.x, sh.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
      // head glow
      ctx.globalAlpha = sh.life;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(sh.x, sh.y, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      if (sh.life <= 0 || sh.x > W + 120 || sh.y > H + 120) shooters.splice(i, 1);
    }

    // firework rockets rising, then bursting at their apex
    for (let i = rockets.length - 1; i >= 0; i--) {
      const rk = rockets[i];
      rk.y += rk.vy;
      rk.vy += 0.12;                 // gravity slows the climb
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = rk.color;
      ctx.beginPath(); ctx.arc(rk.x, rk.y, 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 0.3;         // little trail
      ctx.beginPath(); ctx.arc(rk.x, rk.y + 6, 1.3, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      if (rk.vy >= -1 || rk.y <= rk.ty) {
        if (rk.shower) explodeShower(rk.x, rk.y);
        else if (rk.peony) explodePeony(rk.x, rk.y, rk.color);
        else explode(rk.x, rk.y, rk.color, rk.big);
        rockets.splice(i, 1);
      }
    }

    // stardust
    for (let i = dust.length - 1; i >= 0; i--) {
      const p = dust[i];
      p.px = p.x; p.py = p.y;          // last position, for motion trails
      p.vy += (p.grav != null ? p.grav : 0.05);   // gravity (willow sparks fall more)
      p.vx *= (p.drag != null ? p.drag : 0.98);
      if (p.drag != null) p.vy *= p.drag;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 1;
      p.tw += 0.3;
      p.rot += p.vr;
      const a = Math.max(0, p.life / p.max) * (0.6 + Math.sin(p.tw) * 0.4);
      ctx.globalAlpha = Math.max(0, a);
      ctx.fillStyle = p.color;
      if (p.shape === "streak") {
        // peony/willow spark: a glowing line from last position to current,
        // so the spark reads as a long golden trail that droops with gravity
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.r;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 0.7, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === "grain") {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.r * 0.42, p.r, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (p.life <= 0) dust.splice(i, 1);
    }
    ctx.globalAlpha = 1;

    // name written in the stars — flies in and holds, twinkling
    if (nameStars.length) {
      for (const s of nameStars) {
        s.x += (s.tx - s.x) * 0.07;
        s.y += (s.ty - s.y) * 0.07;
        s.tw += 0.05;
        const a = (0.65 + Math.sin(s.tw) * 0.35) * nameAlpha;
        ctx.globalAlpha = Math.max(0, a * 0.35);
        ctx.fillStyle = "#fff2c4";
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 2.6, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = Math.max(0, a);
        ctx.fillStyle = "#fff7d6";
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    requestAnimationFrame(draw);
  }

  // ---------------------------------------------------------------- lanterns
  let floaterUID = 0;
  function shade(hex) {  // darken a hex color ~40%
    const h = hex.replace("#", "");
    const n = h.length === 3 ? h.split("").map((x) => x + x).join("") : h;
    const r = Math.round(parseInt(n.slice(0, 2), 16) * 0.6);
    const g = Math.round(parseInt(n.slice(2, 4), 16) * 0.6);
    const b = Math.round(parseInt(n.slice(4, 6), 16) * 0.6);
    return `rgb(${r},${g},${b})`;
  }

  function lanternSVG(glow) {
    const id = "lg" + (floaterUID++);
    return `
      <svg viewBox="0 0 46 68" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="${id}" cx="50%" cy="38%" r="60%">
            <stop offset="0%" stop-color="#fff6cf"/>
            <stop offset="55%" stop-color="${glow}"/>
            <stop offset="100%" stop-color="#e8873a"/>
          </radialGradient>
        </defs>
        <ellipse cx="23" cy="30" rx="20" ry="10" fill="#ffcf7a" opacity="0.25"/>
        <path d="M8 20 Q23 -2 38 20 L36 46 Q23 56 10 46 Z" fill="url(#${id})"/>
        <rect x="12" y="46" width="22" height="5" rx="2" fill="#7a4a1e"/>
        <path d="M14 51 L18 58 M32 51 L28 58" stroke="#7a4a1e" stroke-width="1.2" fill="none"/>
        <circle cx="23" cy="52" r="2.4" fill="#fff3c0"/>
      </svg>`;
  }

  function floaterSVG(type, color) {
    const id = "fg" + (floaterUID++);
    if (type === "crane") {
      const dark = shade(color);
      return `<svg viewBox="0 0 60 48" xmlns="http://www.w3.org/2000/svg">` +
        `<polygon points="30,26 6,11 30,18" fill="${color}"/>` +          // left wing (light)
        `<polygon points="30,26 54,11 30,18" fill="${dark}"/>` +          // right wing (shade)
        `<polygon points="30,18 21,2 31,16" fill="${color}"/>` +          // neck + head up
        `<polygon points="30,26 53,41 33,28" fill="${dark}"/>` +          // long tail down-right
        `<polygon points="30,18 30,26 20,41" fill="${color}"/>` +         // body
        `<polygon points="21,2 18,6 24,6" fill="${dark}"/>` +             // beak
        `</svg>`;
    }
    if (type === "star") {
      return `<svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">` +
        `<path d="M22 3 L27 16 L41 17 L30 26 L34 40 L22 32 L10 40 L14 26 L3 17 L17 16 Z" ` +
        `fill="${color}" stroke="#ffffff" stroke-width="0.7"/></svg>`;
    }
    if (type === "balloon") {
      return `<svg viewBox="0 0 40 56" xmlns="http://www.w3.org/2000/svg">` +
        `<defs><radialGradient id="${id}" cx="38%" cy="28%" r="72%">` +
        `<stop offset="0%" stop-color="#ffffff" stop-opacity="0.85"/><stop offset="42%" stop-color="${color}"/><stop offset="100%" stop-color="${shade(color)}"/>` +
        `</radialGradient></defs>` +
        `<path d="M20 2 C9 2 3 11 3 21 C3 33 13 41 20 43 C27 41 37 33 37 21 C37 11 31 2 20 2 Z" fill="url(#${id})"/>` +
        `<path d="M20 43 l-3 5 l6 0 z" fill="${color}"/></svg>`;
    }
    return lanternSVG(color);
  }

  function popLantern(l) {
    if (l.el.classList.contains("popped")) return;
    l.el.classList.add("popped");
    const r = l.el.getBoundingClientRect();
    stardustBurst(r.left + r.width / 2, r.top + r.height / 2, palette);
    launchShooter(true);
    chime();
    setTimeout(() => l.el.remove(), 260);
    lanterns = lanterns.filter((x) => x !== l);
    if (lanterns.length === 0 && typeof l.onAll === "function") l.onAll();
  }

  const WARM = ["#ffb15c", "#ffce6b", "#ff9f68"];
  function launchFloaters(count, type, onAll, autoClean, riseDur) {
    type = type || "lantern";
    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.className = "lantern";   // reuse the rise + pop styling
      const color = type === "lantern" ? WARM[i % WARM.length] : fwColors[i % fwColors.length];
      el.innerHTML = floaterSVG(type, color);
      const size = 34 + Math.random() * 26;
      el.style.width = size + "px";
      el.style.left = Math.random() * (W - size) + "px";
      // riseDur (seconds) lets a caller make floaters linger much longer so
      // several screens' worth can coexist; default stays the quick 9-16s
      const dur = riseDur ? (riseDur + Math.random() * (riseDur * 0.3)) : (9 + Math.random() * 7);
      const delay = Math.random() * 4;
      const sway = (Math.random() * 34 + 16) * (Math.random() > 0.5 ? 1 : -1);
      el.style.animation = `lantern-rise ${dur}s linear ${delay}s forwards`;
      el.style.setProperty("--sway", sway + "px");
      const l = { el, onAll };
      const h = (e) => { e.preventDefault(); popLantern(l); };
      el.addEventListener("click", h);
      el.addEventListener("touchstart", h, { passive: false });
      // auto-clean only when asked (continuous streams), so the grand finale
      // can still pile everything up on repeated "Celebrate again" presses
      if (autoClean) {
        el.addEventListener("animationend", () => {
          if (!el.classList.contains("popped")) {
            el.remove();
            lanterns = lanterns.filter((x) => x !== l);
          }
        });
      }
      lanternLayer.appendChild(el);
      lanterns.push(l);
    }
  }
  function launchLanterns(count, onAll) { launchFloaters(count, "lantern", onAll); }

  function clearLanterns() {
    lanterns.forEach((l) => l.el.remove());
    lanterns = [];
  }

  // ---------------------------------------------------------------- sound
  let ac = null;
  // must be called from a user gesture on mobile, or Web Audio stays muted
  function unlockAudio() {
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === "suspended") ac.resume();
    } catch (e) { /* ignore */ }
  }
  function chime() {
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === "suspended") ac.resume();
      const notes = [660, 880, 990];
      notes.forEach((f, i) => {
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.type = "sine";
        o.frequency.value = f;
        const t = ac.currentTime + i * 0.06;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.14, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
        o.connect(g); g.connect(ac.destination);
        o.start(t); o.stop(t + 0.42);
      });
    } catch (e) { /* silent */ }
  }

  function boom() {
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === "suspended") ac.resume();
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(180, ac.currentTime);
      o.frequency.exponentialRampToValueAtTime(55, ac.currentTime + 0.25);
      g.gain.setValueAtTime(0.42, ac.currentTime);   // same tone as before, just louder
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.35);
      o.connect(g); g.connect(ac.destination);
      o.start(); o.stop(ac.currentTime + 0.36);
    } catch (e) { /* silent */ }
  }

  function setPalette(p) { if (p && p.length) palette = p; }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(draw);

  return {
    setPalette,
    shootingStar,
    stardustBurst,
    riceBurst,
    meteorShower,
    starShower,
    firework,
    fireworksShow,
    fireworkCluster,
    bigGoldFirework,
    flash,
    nameInStars,
    clearName,
    showName,
    fadeName,
    setFireworkTheme,
    launchLanterns,
    launchFloaters,
    clearLanterns,
    unlockAudio,
  };
})();

/* keyframes for lantern rise */
(function injectLanternKeyframes() {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes lantern-rise {
      0%   { transform: translateY(10vh) translateX(0); opacity: 0; }
      12%  { opacity: 1; }
      50%  { transform: translateY(-55vh) translateX(var(--sway, 20px)); }
      100% { transform: translateY(-125vh) translateX(0); opacity: 0.9; }
    }`;
  document.head.appendChild(style);
})();
