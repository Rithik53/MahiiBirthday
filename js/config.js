/* ============================================================================
 *  ✷  THIS IS THE ONLY FILE YOU NEED TO EDIT  ✷
 * ----------------------------------------------------------------------------
 *  Everything personal lives here. Fill in the real stuff:
 *  her name, your inside jokes, the little moments from your chats, etc.
 *
 *  The whole thing is a night sky she wanders through. Each "constellation"
 *  is one story flow. Once she's lit them all, the finale unlocks.
 *
 *  Nothing here is sent anywhere. It just runs in the browser.
 *  Tips:
 *   - Keep messages short and warm. One or two lines per beat reads best.
 *   - Use "\n" for a line break inside a single message.
 *   - You can add or remove constellations and beats freely.
 * ==========================================================================*/

const CONFIG = {
  // ---- The basics ---------------------------------------------------------
  herName: "Mahii",             // shown throughout
  yourName: "Me",               // your name / how you sign off

  // ⚙️ DEV ONLY: keeps the finale star unlocked so you don't have to click
  //    through every constellation while building. SET TO false BEFORE SHARING.
  devUnlockFinale: true,

  // ---- The song -----------------------------------------------------------
  // Download the song, drop the file in /assets, then put the filename here.
  // Something soft/dreamy suits the sky theme. Leave "" to disable music.
  // Example: "assets/our-song.mp3"
  songPath: "assets/song.mp3",
  songLabel: "Main Koi Aisa Geet Gaaon",
  // The hub plays these songs in order, looping the set. BETWEEN songs it
  // fades out/in. A song made of multiple `parts` plays those parts GAPLESS
  // (no inter-part fade), so a split-up track still feels like one song.
  // If this list is present it takes precedence over songPath on the hub.
  songList: [
    { label: "Dekha Hazaaron Dafaa", parts: ["assets/hub0.mp3"] },
    { label: "Main Koi Aisa Geet Gaaon", parts: ["assets/hub1.mp3", "assets/hub2.mp3", "assets/hub3.mp3"] },
  ],

  // ---- Opening screen -----------------------------------------------------
  intro: {
    kicker: "look up...",
    title: "Happy Birthday",     // herName is added automatically after this
    subtitle: "I made you a little sky. Tap to step into it.",
    button: "Open the sky →",
  },

  // ---- Spoof consent screen (inside joke for the privacy lawyer) ----------
  // Shown once she taps "Open the sky". Set to null to skip entirely.
  consent: {
    kicker: "one quick formality...",
    title: "Privacy & Sky Notice 🍪",
    subtitle: "For the privacy lawyer in the room. Kindly review and consent.",
    clauses: [
      "By entering, you consent to being celebrated.",
      "Data collected: your attention (~2 mins) and exactly one (1) smile. Retention period: indefinite.",
      "Cookie policy: we'd offer you the edible kind, but the screen's in the way.",
      "No data ever leaves this device. You're welcome to audit the source, counselor.",
      "You may withdraw consent by closing the tab. But, respectfully, why would you.",
    ],
    check: "I have read all of the above (you actually did, didn't you).",
    acceptLabel: "I consent ✨",
    rejectLabel: "Reject all",
    rejectReply: "Objection noted. Overruled. 🙂 This clause is non-negotiable.",
  },

  // ---- The hub (constellation map) ----------------------------------------
  hub: {
    title: "Pick a star",
    subtitle: "Four little chapters, best read in order. Light all four to unlock the last one.",
    finaleLockedLabel: "☆ one more star, once the sky is lit",
    finaleUnlockedLabel: "🌟 The brightest one, open it",
  },

  // ---- Make a wish (right before the finale) ------------------------------
  wish: {
    kicker: "the whole sky is lit ✷",
    title: "Now, make a wish",
    subtitle: "Close your eyes and make one. Tonight the whole sky is listening — catch the shooting star and it'll carry your wish wherever it needs to go.",
    hint: "(tap the star to send it up)",
    granted: "it's on its way. the sky's got it from here. ✷",
  },

  /* ---- Constellations (story flows) --------------------------------------
   *  Each is one flow she taps through beat by beat.
   *  - icon:   an emoji/star shown on the card
   *  - title:  card title
   *  - teaser: one line on the card
   *  - beats:  array of screens. Each is { text } + optional { note }
   *            for a small handwritten-style caption above it.
   *
   *  >>> Replace the placeholders with YOUR real moments and inside jokes.
   *      That's what makes it hers and not a template. <<<
   */
  chapters: [
    {
      id: "hello",
      icon: "✦",
      title: "How we started",
      teaser: "the first message",
      decor: "redstring",   // subtle red thread that connects a little more each beat
      song: "assets/ch1.mp3",   // loops while this chapter is open (drop your clip here)
      songLabel: "Ek Ajnabee Haseena Se",   // shown in the now-playing label
      beats: [
        { text: "Quick rewind. Picture me: no plans, no expectations, dragging myself to Pratik only because a friend wouldn't let it go.", note: "some ordinary June afternoon" },
        { text: "I wasn't there hoping to meet anyone. Sacchi, just burning a lunch break.", note: "famous last words" },
        { text: "I'd dropped into some random empty chair, no idea it wasn't mine to take. Then you came over to that side, and I looked up at just the right moment.", note: "timing" },
        { text: "I gestured and asked if the seat was yours. You shook your head, no, and carried on with your day.", note: "very smooth, me" },
        { text: "One question stuck in my head that whole afternoon. Honestly, it never really left.", note: "who <em>is</em> she 👀" },
        { text: "Out of all the chairs, and all the reasons I had to skip that afternoon, somehow we met.", note: "still can't get over that" },
      ],
    },
    {
      id: "sky",
      icon: "✷",
      title: "You & the sky",
      teaser: "why a whole sky",
      skyShow: true,        // moon phase + self-drawing constellation
      songs: [
        { src: "assets/ch2a.mp3", label: "Surili Akhiyon Wale" },
        { src: "assets/ch2.mp3",  label: "Tumhe Aaj Maine Jo Dekha" },
      ],
      beats: [
        { text: "Anyone who knows you knows this one: you love the sky. Sunsets, stars, the whole lot.", note: "your kind of scenery" },
        { text: "So when I wanted to say something a bit too big for a text, I figured I'd put it where you already like to look. Up.", note: "hence, all this ✷" },
        { text: "Funny part — I never really noticed the sky before. Somewhere along the way, around you, I started looking up more.", note: "your doing, clearly" },
        { text: "I think I get why it settles you. Look up long enough and the loud stuff goes quiet. Aap se baat karte hue bhi kuch waise hi hota hai.", note: "the quiet kind of nice 🌙" },
        { text: "So no big speech from me. Bas itna — jahan aap dekhna pasand karti ho, maine wahan hi kuch keh diya.", note: "subtle, I know" },
        { text: "This whole thing — every chapter — is just me still looking for the right words. Keep going; the real ones are waiting at the end." },
      ],
    },
    {
      id: "rice",
      icon: "🌾",
      title: "The rice empire",
      teaser: "meanwhile, our startup",
      meter: "rice",   // shows a rice bag that fills up with each step
      burst: "rice",   // gold rice-grain shower when she finishes this one
      song: "assets/ch3.mp3",
      songLabel: "Chaar Kadam",
      beats: [
        {
          text: "Quick intermission from all the feelings. Item on the agenda: {her} Rice Co.™ is officially hiring.\nHQ: Bangalore. Sole supplier: the good stuff from Raipur, couriered by Mum.",
          note: "welcome, boss 🌾",
          button: "Start onboarding →",
        },
        {
          type: "choice",
          note: "screening: question 1",
          prompt: "Where does the <em>actually good</em> rice come from? (choose one)",
          options: [
            { label: "Raipur, obviously 🌾", reply: "Correct. You'd be shocked how many people fail question one." },
            { label: "the Bangalore supermarket", reply: "Wrong. Security's been alerted. Please step away from the aisle." },
            { label: "somewhere up north?", reply: "Vague… but your mum's parcels forgive you." },
          ],
        },
        {
          type: "choice",
          note: "screening: question 2",
          prompt: "How do we scale distribution nationwide?",
          options: [
            { label: "mum's parcels ✈️", reply: "Genius. Zero overhead. Aunty is now Head of Logistics." },
            { label: "I smuggle a bag on every flight", reply: "That's literally our current model. Employee #1 (me) handles the smuggling." },
            { label: "franchise the whole thing", reply: "Ambitious. We'll discuss equity over CB." },
          ],
        },
        {
          type: "letter",
          button: "Accept & sign ✍️",
          letter: {
            company: "{her} Rice Co.™",
            tagline: "Fragrant rice. Questionable logistics. Big dreams.",
            heading: "Letter of Employment",
            lines: [
              "Dear Founder &amp; CEO ({her}),",
              "This confirms your very first hire: <b>Chief Bag-Carrier &amp; Loyal Employee #1</b>.",
              "Duties: hauling rice from Raipur, hyping the brand, and happily working under you, indefinitely.",
              "Compensation: paid in rice, plus the rare privilege of annoying you daily.",
            ],
            signature: "Me",               // auto-fills your name
            signRole: "reporting for duty 🙋",
          },
        },
      ],
    },
    {
      id: "little",
      icon: "🌙",
      title: "The honest bit",
      teaser: "what you actually did",
      meter: "bloom",       // a flower that opens a little more with each step
      song: "assets/ch4.mp3",
      songLabel: "Maskara",
      beats: [
        { text: "Okay, jokes aside for a second. Nothing cinematic happened. No big turning point, no fireworks (well… until now).", note: "meta, I know" },
        { text: "I like that your eyes don't wander when we talk. You actually listen, which is rarer than people admit.", note: "certified fact" },
        { text: "And that grin, the one that's basically always on your face, honestly out of words." },
        { text: "Somewhere in there you made me curious again, about people, about the day, about what might happen next." },
        { text: "And curiosity, turns out, is a sneaky way of falling back in step with your own life.", note: "who knew" },
      ],
    },
  ],

  // ---- The finale (the big message) --------------------------------------
  finale: {
    title: "Dearest",            // herName added automatically
    nameDisplay: "Mahiiii…",     // shown after "Dearest" on the message page (instead of the ✷)
    lines: [
      "Kehte hain, a butterfly apne hi wings kabhi nahi dekh paati. Everyone else does, bas usse yakeen nahi hota.",
      "Aap bhi thodi waise hi ho. You don't notice what you do to a room. Par maine dekha hai.",
      "Aur sach mein, aapse baat karne ka best part aapke voice notes hote hain. Truly. (Aap podcasts pe kamaal kar dogi, hehe.)",
      "Aapne mujhe phir se sach mein muskurana sikha diya, aur yaad dilaya ki zindagi bahut choti hai half-present jeene ke liye.",
      "Aapne ek baar kaha tha ki aapko itna matter nahi karna chahiye. But you do, and to a far greater deal than you'd think.",
      "Happy birthday, {her}. Still glad I made up my mind to come to Pratik that afternoon. ☀️",
      "Here's to more conversations, more nonsense, and more of you.",
    ],
    signoff: "",                // no sign-off on the message page; name only in grand finale
    song: "assets/finale.mp3",  // fallback single clip (used if `songs` below is empty)
    songLabel: "Tum Se Hi",
    // Dearest Mahii plays these in order, then loops the pair:
    songs: [
      // trimEndMs: stop this clip N ms before its real end and move to the next
      { src: "assets/finale1.mp3", label: "Aankhon Mein Teri Ajab Si", trimEndMs: 2000 },
      { src: "assets/finale.mp3",  label: "Tum Se Hi" },
    ],
    // A self-aware wink at the fact that you go a step too far, and she always
    // says it's "too much." Shown last, in handwriting. Set to "" to hide.
    ps: "P.S. I know. A whole sky is a lot. 'Too much,' you'd say. You'd be right. I'd do it again. Some people are worth the extra step. 🌙",
    moreLabel: "wait... there's more ✨",
    replayLabel: "↺ Watch the sky again",
  },

  // ---- The grand finale (the real ending: fireworks, lanterns, everything) --
  // She taps "there's more" after the P.S. and the whole sky goes off.
  grandFinale: {
    kicker: "okay, THIS is the last one",
    title: "Happy Birthday",     // herName + 🎂 added automatically
    lines: [
      "I couldn't fit it all into words, so I borrowed the sky.",
      "You've made these last few weeks feel lighter than they had any right to.",
      "I hope your day is as pretty as you are.",
      "Happy birthday, {her}. 🎂",
    ],
    signoff: "Me",               // auto-fills yourName; set to "" to hide
    againLabel: "🎂 Celebrate you again",   // replays the whole fireworks show in place
    // soft instrumental under the fireworks (set to "" for fireworks-only silence)
    song: "assets/grand.mp3",
    songLabel: "Mudhal Nee Mudivum Nee",
    // The full playlist (all the songs used here, in full) — shown as a clearly
    // branded Spotify button at the very end. Set url to "" to hide it.
    spotify: {
      url: "https://open.spotify.com/playlist/0kz21o0zNYxIky7xyMnVmC?si=6H7mjLjvTy2791UX0Ohr7A",
      label: "For Mahii",
    },
  },

  // ---- Look & feel (optional) --------------------------------------------
  theme: {
    // stardust + shooting-star colors (starlight golds + soft blues)
    palette: ["#fff7d6", "#ffe9a8", "#ffd166", "#cfe8ff", "#a8c7ff", "#ffffff"],
    // how many sky lanterns drift up on the finale (tap them to burst)
    lanternCount: 14,
  },
};
