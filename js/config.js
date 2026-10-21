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
  yourName: "Rithik",               // your name / how you sign off

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
    { label: "Main Koi Aisa Geet Gaaon", parts: ["assets/hub1.mp3", "assets/hub2.mp3", "assets/hub3.mp3"], vol: 0.7 },
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

  // ---- Music opt-in (after consent) --- a gentle pun about her "elite" taste
  musicGate: {
    title: "Sound on?",
    // the pun: she's got elite music taste; this won't live up to it, but it tried
    subtitle: "Fair warning: your taste is elite, and this is… an honest attempt. Shall we press play anyway?",
    yesLabel: "🎵 Play it",
    noLabel: "🔇 I'll pass",
    yesIcon: "🎵",
    noIcon: "🔇",
  },

  // ---- The hub (constellation map) ----------------------------------------
  hub: {
    title: "Pick a star",
    subtitle: "Four little chapters, Light all four to unlock the last one.",
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
    decor: "redstring",
    song: "assets/ch1.mp3",
    songLabel: "Ek Ajnabee Haseena Se",
    beats: [
      {
        text: "Quick rewind. Picture me: no plans, no expectations, dragging myself to Pratik only because a friend wouldn't let it go.",
        note: "some ordinary June afternoon"
      },
      {
        text: "I genuinely wasn't expecting anything interesting that day. Just trying to get through a lunch break.",
        note: "famous last words"
      },
      {
        text: "I'd picked some random empty chair, completely unaware I might've stolen someone else's spot. Then you came over to that side, and I happened to look up at just the right moment.",
        note: "timing, apparently"
      },
      {
        text: "I gestured and asked if the seat was yours. You shook your head, said no, and went about your day. Meanwhile, my brain decided this tiny interaction deserved a permanent spot in its memory.",
        note: "very normal behaviour, me"
      },
      {
        text: "It's funny how you never know which ordinary afternoon will turn into a memory you'll look back on with a smile.",
        note: "didn't see that coming"
      },
      {
        text: "Out of all the chairs and all the reasons I had to skip that afternoon, I ended up meeting you. Nothing dramatic. Just one of those little coincidences that made an ordinary day a little less ordinary.",
        note: "and that's where this begins ✨"
      },
    ],
  },

  {
    id: "sky",
    icon: "✷",
    title: "You & the sky",
    teaser: "the stars I can never find",
    skyShow: true,
    songs: [
      { src: "assets/ch2a.mp3", label: "Surili Akhiyon Wale" },
      { src: "assets/ch2.mp3", label: "Tumhe Aaj Maine Jo Dekha" },
    ],
    beats: [
      {
        text: "Anyone who knows you knows this one: you love the sky. Sunsets, stars, the whole lot.",
        note: "your kind of scenery ☁️"
      },
      {
        text: "And then there's me, looking up at the very same sky and somehow managing to find absolutely nothing. Not a single star. Zero.",
        note: "professional star spotter "
      },
      {
        text: "Meanwhile, you can somehow spot stars even within the city. I genuinely don't understand how you do it. At this point, I think I need you around just to tell me where to look.",
        note: "human telescope 🔭 or Star fairy"
      },
      {
        text: "It's funny, though. We're looking at the same sky, in the same city, and you're out there finding stars while I'm wondering if that tiny dot is even real.",
        note: "same sky, very different results ✨"
      },
      {
        text: "So when I wanted to make you something a little different for your birthday, the sky felt like the obvious choice. It's something you love, and I thought it'd be nice to bring a little piece of it here for you.",
        note: "hence, all this "
      },
      {
      text: "Maybe one day I'll finally learn to spot stars without staring at the sky for ten minutes and questioning every tiny dot I see.",
      note: "still under training 🔭"
      },
      {
        text: "Until then, you can keep being the person who finds stars in a sky where I see none. I'll stick to looking up and pretending I know what I'm doing.",
        note: "your star-finding skills remain unmatched ♡"
      },
    ],
  },

  {
    id: "rice",
    icon: "🌾",
    title: "The rice empire",
    teaser: "meanwhile, our startup",
    meter: "rice",
    burst: "rice",
    song: "assets/ch3.mp3",
    songLabel: "Chaar Kadam",
    beats: [
      {
        text: "Quick intermission. We need to discuss something of national importance: your love for the greatest rice known to humankind. Naturally, this calls for a business venture. Introducing {her} Rice Co.™ — HQ: Bangalore. Sole supplier: the good stuff from Raipur, couriered by Mum.",
        note: "welcome, boss 🌾",
        button: "Start onboarding →",
      },
       {
          type: "choice",
          note: "screening: question 1",
          prompt: "Where does the <em>actually good</em> rice come from? (choose one)",
          options: [
            { label: "Raipur, obviously 🌾", reply: "Correct. You'd be shocked how many people fail question one." },
            { label: "Random Bangalore supermarket", reply: "Wrong. Security's been alerted. Please step away from the aisle." },
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
            { label: "franchise the whole thing", reply: "Ambitious. We'll discuss equity over CB?." },
          ],
        },
    {
  type: "letter",
  button: "Accept & sign ✍️",
  letter: {
    company: "{her} Rice Co.™",
    tagline: "The finest rice. The finest CEO.",
    heading: "Letter of Employment",
    lines: [
              "Dear Founder &amp; CEO ({her}),",
              "This confirms your very first hire: <b>Chief Bag-Carrier &amp; Loyal Employee #1</b>.",
              "Duties: hauling rice from Raipur, hyping the brand, and happily working under you, indefinitely.",
              "Compensation: paid in rice, plus the rare privilege of annoying you sometimes.",
            ],
    signature: "Me",
    signRole: "reporting for duty 🙋",
  },
},
    ],
  },

  {
    id: "little",
    icon: "🌙",
    title: "The honest bit",
    teaser: "the little things I noticed",
    meter: "bloom",
    song: "assets/ch4.mp3",
    songLabel: "Maskara",
    beats: [
      {
        text: "Okay, jokes aside for a second. Nothing cinematic happened. No grand turning point, no dramatic movie scene. Just a collection of little moments that stayed with me.",
        note: "the soundtrack is still pretty good though"
      },
     {
  text: "I like how you are when you're talking to people. You have this way of making everyone feel included and heard, like no one is just standing on the sidelines of a conversation. I think that's a really lovely quality to have.",
  note: "you make room for everyone ♡"
},
      {
       
  text: "And of course, your smile. You have one of those really pretty smiles that you can't help but notice. Especially when you break into that big grin of yours.",
  note: "the grin deserves its own mention"
},
      {
  text: "I got to know someone with her own little world of favourite things, random interests, a love for the sky, and some very strong opinions about, well, quite a few things. Rice included, obviously.",
  note: "a surprisingly well-rounded portfolio"
},
      {
  text: "I guess that's one of the nice things about getting to know someone. You have conversations, share random little moments, and slowly get to know all these different sides of them. It's nice when those moments leave you with a few good memories.",
  note: "some good memories along the way"
},
      {
        text: "So, if there's one thing I wanted this little project to do, it's remind you that you're someone worth celebrating. Not because of what you mean to anybody else, but because there's plenty about you that's worth celebrating in its own right.",
        note: "this one's for you ✨"
      },
    ],
  },
],

  // ---- The finale (the big message) --------------------------------------
  finale: {
    title: "Dearest",            // herName added automatically
    nameDisplay: "Mahiiii…",     // shown after "Dearest" on the message page (instead of the ✷)
    lines: [
      "I don't think you realise how much of a shot of sunshine you are.",
      "I don't mean that in some grand, poetic way. It's just something I've come to notice about you. You've become a little synonymous with light to me. Pata nahi kaise, but somehow, the grass really does feel greener with you in the picture.",
      "And I think that's part of why I enjoy talking to you so much. Even your voice notes have a way of making an ordinary day a little better.",
      "(Also, Mahii, do give podcasting a try someday, will you? The way you put things into words, the lihaaz you have when you speak… I genuinely think you'd be so good at it)",
      "One thing I really like about you is how thoughtfully you express yourself. There's a certain warmth in the way you speak that makes people feel comfortable around you. I don't know if you realise it yourself, but I think that's a really lovely quality to have.",
      "Somewhere along the way, you’ve reminded me to be a little more present in the moment, to enjoy the small things, and not to take the good ones for granted.",
      "You once said you shouldn’t matter so much to me. But honestly, you do. At least to me, you do. And I guess there isn’t always a rationale for why someone comes to mean something to us. Sometimes, it just happens, quietly and without us even realising when. You find yourself feeling grateful that your paths crossed in the first place. I think that’s what happened here, and I’m genuinely glad it did.",
      "Happy birthday, {her}. ☀️",
      "I hope the world never ceases to celebrate you, that life gives you a thousand reasons to smile, and that you always find yourself surrounded by the kind of love and happiness you deserve.",
    ],
    signoff: "",                // no sign-off on the message page; name only in grand finale
    song: "assets/finale.mp3",  // fallback single clip (used if `songs` below is empty)
    songLabel: "Tum Se Hi",
    // Dearest Mahii plays these in order, then loops the pair:
    songs: [
      // trimEndMs: stop this clip N ms before its real end and move to the next
      { src: "assets/finale1.mp3", label: "Aankhon Mein Teri Ajab Si", trimEndMs: 2000, vol: 0.7 },
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
    //kicker: "okay, THIS is the last one",
    kicker: "one last little surprise ✨",
    title: "Happy Birthday",     // herName + 🎂 added automatically
    // one message per celebration (balloons -> stars -> lanterns -> swarm); each
    // "Celebrate again" shows the next. After the last it loops back to the first.
    messages: [
      [
        "I couldn't fit it all into words, so I borrowed the sky.",
        "You've made these last few weeks feel lighter than they had any right to.",
        "I hope the universe gives you a little extra reason to smile today, and many more throughout the year.",
        "Happy birthday, {her}. ☀️",
      ],
      [
        "Here's to all the places you're going and all the things you're yet to discover. ☆",
        "I hope this year brings you closer to the dreams you've been working towards and surprises you with a few you haven't even imagined yet.",
        "I hope you get to take chances that excite you, find yourself in places you've always wanted to see, and look back one day amazed at how far you've come.",
        "The world's a pretty big place, Mahii. I hope you get to see just how much of it is waiting for you.",
      ],
      [
        "If the universe is listening, I've got a few requests for you, Mahii.",
        "More days that turn out better than you expected. More spontaneous plans that become your favourite memories. More opportunities that make you excited about what's next.",
        "A little luck when you need it most, courage when you need to take a leap, and a few beautiful surprises along the way.",
        "And if the universe could make a few of your biggest wishes come true this year, that would be lovely, too. ♡",
      ],
      [
        "And one last birthday wish for you, Mahii. ♡",
        "I hope that when you look back on this year, you'll find a hundred little moments worth keeping. The kind you wish you could relive for just a few seconds longer. The kind that make you think, life can be really beautiful sometimes.",
        "I hope you get opportunities that challenge you, adventures that change your perspective, people who celebrate your wins, and countless reasons to be proud of the person you're becoming.",
        "May the universe be ridiculously generous with you. May your biggest dreams find their way to you, and may life surprise you in ways even you couldn't have wished for.",
        "Happy birthday, {her}. Here's to a year that's every bit as wonderful as you deserve it to be. ☆",
      ],
    ],
    signoff: "",                 // per-message, so no fixed sign-off here
    againLabel: "🎂 Celebrate you again",   // fallback label
    // one button label per screen (matches the 4 messages). The last one is the
    // real "celebrate again"; only the last screen also shows replay + Spotify.
    againLabels: [
      "There's more ✨",
      "One more thing →",
      "And another… ☆",
      "Celebrate again ",
    ],
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
