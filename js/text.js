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
        { text: "I wasn't there hoping to meet anyone. Honestly, just burning a lunch break.", note: "famous last words" },
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
        { text: "Anyone who knows you knows this one: you love the sky. Sunsets, stars, the whole lot.", note: "your kind of scenery ☁️" },
        { text: "So when I wanted to say something a bit too big for a text, I figured I'd put it somewhere you already love looking. Up.", note: "hence, all this ✨" },
        { text: "Funny thing is, I've always loved the sky. But somewhere along the way, I started finding little reminders of you in it, too.", note: "your doing, clearly :')" },
        { text: "I think I get why the sky settles you. Look up long enough and the loud stuff goes quiet. Aap se baat karte hue bhi kuch waise hi hota hai.", note: "the quiet kind of nice ♡" },
        { text: "So no big speech from me. Bas laga, iss baar birthday wish thodi hatke honi chahiye. :')", note: "subtle, I know :')" },
        { text: "This whole thing — every little chapter — is me trying to find the right words. I think I saved the most important ones for the end. Keep going. ♡", note: "almost there ✨" },
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
  text: "Quick intermission. We need to discuss something very important: your love for the greatest rice known to humankind. Naturally, this calls for a business venture. Introducing {her} Rice Co.™ — HQ: Bangalore. Sole supplier: the good stuff from Raipur, couriered by Mum.",
  note: "welcome, boss 🌾",
  button: "Start onboarding →",
}
,
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