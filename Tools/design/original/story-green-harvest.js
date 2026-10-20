/* The Green Harvest: every story screen, teaching card and in-stage remark.
 * A beat is one screen: an illustrated scene, the Owl's eye state, and lines.
 * Speakers: "" narrator, "owl", "pumpkin", "weaver". Izan never speaks.
 * `fx` on a beat names a one-shot effect the app plays when the beat appears. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HNStory = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const n = (text) => ({ who: "", text });
  const owl = (text) => ({ who: "owl", text });
  const pumpkin = (text) => ({ who: "pumpkin", text });
  const weaver = (text) => ({ who: "weaver", text });

  const chapters = ["The Lifted Stones", "Under the Web", "The House on the Hill"];
  const chapterOf = (stage) => (stage <= 4 ? 0 : stage <= 10 ? 1 : 2);

  const prologue = [
    {
      scene: "graveyard",
      eyes: "open",
      lines: [
        n("In Hollowmere, every new grave is given a pumpkin seed."),
        n("On Hollow Night the village lights one window for each of its dead, and the pumpkins ripen orange to show them the way home."),
      ],
    },
    {
      scene: "plot",
      eyes: "closed",
      lines: [
        n("This year nothing ripened. Under the lifted stones, the green ones were talking."),
        pumpkin("At midnight the windows light. We climb the silk, and we eat them. Every one."),
        weaver("Eat the lights, little gourds, and you never have to ripen. Never go anywhere. Stay green with me."),
      ],
    },
    {
      scene: "spotted",
      eyes: "narrow",
      fx: "lightning",
      lines: [
        n("A small black rabbit was listening. He had no voice to give himself away."),
        n("His paw found a loose pebble instead."),
        pumpkin("A rabbit. It heard us."),
      ],
    },
    {
      scene: "chase",
      eyes: "open",
      lines: [owl("Three hundred of them and one of you."), owl("The house on the hill is that way. Up. Hop.")],
    },
  ];

  const before = {
    1: [
      {
        scene: "owl",
        eyes: "open",
        lines: [
          owl("Pull back, aim, let go. A pumpkin hit fast bursts. A pumpkin touched slowly bites."),
          owl("You don't have to break them. But every one you break is one less at the windows tonight."),
        ],
      },
    ],
    2: [
      {
        scene: "chase",
        eyes: "open",
        lines: [owl("They follow the warmth of you."), owl("While you aim, the whole graveyard holds its breath. Use that.")],
      },
    ],
    3: [
      {
        scene: "owl",
        eyes: "narrow",
        lines: [owl("One of them sits on the crypt step like it owns the place."), owl("Tap while you fly. Go through it, not around it.")],
      },
    ],
    4: [
      {
        scene: "seesaw",
        eyes: "open",
        lines: [
          owl("The old stones were balanced on their posts before she lifted them. Some still are."),
          owl("Come down hard on one end. See what the other end does."),
        ],
      },
    ],
    5: [
      {
        scene: "web",
        eyes: "open",
        lines: [owl("She lifted the grave stones to build her ladder. They swing on her threads."), owl("Ride one. Leap when it leans close.")],
      },
    ],
    6: [
      {
        scene: "web",
        eyes: "open",
        lines: [owl("Silk. It holds you once, like a hand that doesn't want to let go."), owl("Then it tears. Leap before you think about it.")],
      },
    ],
    7: [
      {
        scene: "web",
        eyes: "narrow",
        lines: [owl("Not every web is sticky. The tight ones she strung to throw things away from her."), owl("Let her throw you.")],
      },
    ],
    8: [
      {
        scene: "zip",
        eyes: "open",
        lines: [owl("Her long threads cross the whole pit."), owl("Catch one and slide. Anything sitting on it will meet you at speed.")],
      },
    ],
    9: [
      {
        scene: "nest",
        eyes: "narrow",
        lines: [
          owl("Some of them sleep between the grave posts, where no rabbit fits."),
          owl("The stones above hang by frayed threads. You are heavier than you look."),
        ],
      },
    ],
    10: [
      {
        scene: "owl",
        eyes: "narrow",
        lines: [
          owl("I should tell you something. The Weaver did not learn about the windows on her own."),
          owl("I told her. I thought she would like the view."),
          owl("Up here the threads are slack. Watch a thread tremble: that stone is about to go."),
        ],
      },
    ],
    11: [
      {
        scene: "house",
        eyes: "open",
        lines: [
          n("The front door was barred with silk, so he went in the way the cold does: through the cellar."),
          owl("A loose one. Pumpkins roll, you know. Into each other, off edges, into walls."),
        ],
      },
    ],
    12: [
      {
        scene: "house",
        eyes: "closed",
        lines: [owl("The cellar goes down a long way. Fall carefully."), owl("I will keep count out here.")],
      },
    ],
    13: [
      {
        scene: "house",
        eyes: "open",
        lines: [owl("The family's cauldrons. Still warm."), owl("Drop into one and it will throw you to the rafters.")],
      },
    ],
    14: [
      {
        scene: "weaver",
        eyes: "open",
        lines: [
          weaver("Little rabbit. You came all this way to stand at a window that will not light for you."),
          weaver("Stay. Stay green with us. Nobody here ever has to go anywhere."),
          owl("Don't answer her. Hit her. Three times, and hard."),
        ],
      },
    ],
  };

  const after = {
    4: [
      {
        scene: "crypt",
        eyes: "narrow",
        title: "Out of the Graveyard",
        lines: [
          n("The crypt door closed behind him. Green faces pressed against the bars."),
          owl("They will go around. They always go around. The only way to the hill now is up, through her silk."),
        ],
      },
    ],
    10: [
      {
        scene: "house",
        eyes: "closed",
        title: "The Garden Gate",
        lines: [
          n("At the top of the web, the garden gate of the house on the hill stood open."),
          owl("Go in. I am not ready to look at that window."),
        ],
      },
    ],
    14: [
      {
        scene: "fall",
        eyes: "open",
        title: "Midnight",
        lines: [
          n("The Weaver fell, and every thread in the valley snapped at once. The grave stones dropped home."),
          n("One by one the windows of Hollowmere lit, and one by one the pumpkins below them turned orange."),
        ],
      },
      {
        scene: "window",
        eyes: "open",
        lines: [
          n("In the house on the hill, one window was still lit, waiting for a small black rabbit."),
          owl("Counted. All of them. And one rabbit."),
          n("He went in. The door closed softly behind him."),
        ],
      },
      { scene: "green", eyes: "narrow", lines: [n("Somewhere past the far trees, one pumpkin is still green.")] },
    ],
  };

  // Teaching cards: shown once, the first time an object of that kind is on screen.
  // `gesture` picks the hand animation; `focus` says what the camera looks at.
  const tips = {
    launch: { gesture: "drag", lines: ["Pull Izan back, like a slingshot.", "Let go to leap."] },
    hunter: { gesture: "none", lines: ["It smelled you.", "Hit it fast, or it bites."] },
    dash: { gesture: "tap", lines: ["Tap in the air to dash.", "Once per leap. It breaks what it hits."] },
    seesaw: { gesture: "drop", lines: ["Balanced on a post.", "Land hard on one end and the other end throws."] },
    mover: { gesture: "none", lines: ["It swings on her thread.", "Ride it, and leap when it leans close."] },
    web: { gesture: "none", lines: ["Sticky silk.", "It catches you once. Leap again from it."] },
    trampoline: { gesture: "none", lines: ["Tight silk.", "It throws you back, hard."] },
    zip: { gesture: "none", lines: ["A long thread.", "Touch it to slide. Tap to let go early."] },
    drop: { gesture: "none", lines: ["A frayed thread.", "Stand on the stone and it falls. Leap, or ride it."] },
    post: { gesture: "none", lines: ["Something sleeps between the posts.", "No rabbit fits. A stone does."] },
    ghost: { gesture: "none", lines: ["Slack thread.", "The stone fades and returns. It trembles before it goes."] },
    spider: { gesture: "tap", lines: ["Her children.", "Dash through them, or go around."] },
    roll: { gesture: "none", lines: ["A loose pumpkin.", "Hit it and it rolls. Into others, off edges, into walls."] },
    cannon: { gesture: "none", lines: ["A cauldron.", "Drop in and it throws you."] },
    boss: { gesture: "tap", lines: ["The Weaver.", "Three hard hits. Her silk bombs kill."] },
  };

  // Short Owl remarks during play. Each fires once per stage visit, by event name.
  const remarks = {
    firstSmash: ["Good. That one was loud.", "One less at the windows."],
    smashAll: ["Three. All three.", "Not one of them reaches the house."],
    death: ["Slowly is how rabbits get eaten.", "Again. Faster this time."],
    deathThird: ["Stop. Breathe. Where are they, and where are you?"],
    crush: ["Heavier than you look."],
    boing: ["Ha. Again."],
    zip: ["Hold on."],
    roll: ["Strike."],
    bossHit: ["Again!", "Once more!"],
  };

  return { chapters, chapterOf, prologue, before, after, tips, remarks };
});
