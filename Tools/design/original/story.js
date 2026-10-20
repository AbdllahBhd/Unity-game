/* The tales of Mqidec: the order of the story screens. Every line is an id in the
 * text table (text.js, built from Tools/design/yennayer-script.md by build-text.py).
 * A beat is one screen: a scene to draw and the line ids shown on it, in order.
 * The hearth opens and closes each night; between them the tale's own scenes play. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HNStory = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const beat = (scene, lines, fx) => ({ scene, lines, fx });

  const opening = [beat("hearth", ["open.1", "open.2", "open.3"])];
  const firstNight = [beat("hearth", ["open.4", "open.5", "open.6"])];
  const closing = [beat("home", ["close.1", "close.2"]), beat("hearth", ["close.3", "close.4"])];

  const tales = {
    1: {
      intro: [
        beat("hearth", ["t1.intro.1", "t1.intro.2", "t1.intro.3"]),
        beat("kitchen", ["t1.intro.4", "t1.intro.5", "t1.intro.6"]),
      ],
      stages: {
        1: [beat("kitchen", ["t1.s1", "t1.s1.child"])],
        2: [beat("kitchen", ["t1.s2", "t1.s2.child"])],
        3: [beat("kitchen", ["t1.s3", "t1.s3.child"])],
        4: [beat("kitchen-sleep", ["t1.s4", "t1.s4.child"])],
      },
      end: [beat("kitchen-trap", ["t1.end.1", "t1.end.2", "t1.end.3"], "thud"), beat("hearth", ["t1.end.4", "t1.end.5"])],
    },
    2: {
      intro: [
        beat("hearth", ["t2.intro.1", "t2.intro.2"]),
        beat("loom", ["t2.intro.3", "t2.intro.4"]),
      ],
      stages: {
        5: [beat("loom", ["t2.s1", "t2.s1.child"])],
        6: [beat("loom", ["t2.s2", "t2.s2.child"])],
        7: [beat("loom", ["t2.s3", "t2.s3.child"])],
        8: [beat("loom-wait", ["t2.s4", "t2.s4.child"])],
      },
      end: [beat("loom-trap", ["t2.end.1", "t2.end.2", "t2.end.3"]), beat("roof", ["t2.end.4", "t2.end.5"])],
    },
    3: {
      intro: [
        beat("gorge", ["t3.intro.1", "t3.intro.2", "t3.intro.3"], "wind"),
        beat("hearth", ["t3.intro.4", "t3.intro.5"]),
      ],
      stages: {
        9: [beat("gorge", ["t3.s1", "t3.s1.child"])],
        10: [beat("gorge", ["t3.s2", "t3.s2.child"])],
        11: [beat("gorge", ["t3.s3", "t3.s3.child", "t3.s3.child2"])],
        12: [beat("gorge-gate", ["t3.s4", "t3.s4.child"])],
      },
      end: [
        beat("gorge-trap", ["t3.end.1", "t3.end.2", "t3.end.3"], "thud"),
        beat("home", ["t3.end.4", "t3.end.5", "t3.end.6"]),
      ],
    },
    4: {
      intro: [
        beat("hearth", ["t4.intro.1", "t4.intro.2", "t4.intro.3"]),
        beat("citadel", ["t4.intro.4", "t4.intro.5"]),
      ],
      stages: {
        13: [beat("citadel", ["t4.s1", "t4.s1.child"])],
        14: [beat("citadel", ["t4.s2", "t4.s2.child"])],
        15: [beat("citadel", ["t4.s3", "t4.s3.child"])],
        16: [beat("citadel-teryel", ["t4.s4", "t4.s4.child"])],
      },
      end: [beat("citadel-trap", ["t4.end.1", "t4.end.2", "t4.end.3"], "thud"), beat("hearth", ["t4.end.4", "t4.end.5"])],
    },
    5: {
      intro: [
        beat("hearth", ["t5.intro.1", "t5.intro.2", "t5.intro.3"]),
        beat("press", ["t5.intro.4", "t5.intro.5", "t5.intro.6"]),
      ],
      stages: {
        17: [beat("press", ["t5.s1", "t5.s1.child"])],
        18: [beat("press", ["t5.s2", "t5.s2.child"])],
        19: [beat("press", ["t5.s3", "t5.s3.child"])],
        20: [beat("press-beam", ["t5.s4", "t5.s4.child"])],
      },
      end: [beat("press-trap", ["t5.end.1", "t5.end.2", "t5.end.3"], "thud"), beat("hearth", ["t5.end.4", "t5.end.5"])],
    },
  };

  // Teaching cards: object kind -> text id. Shown once each, the first time it appears.
  const tips = {
    launch: "tip.launch",
    hunter: "tip.hunter",
    dash: "tip.dash",
    roll: "tip.roll",
    cannon: "tip.cannon",
    web: "tip.web",
    trampoline: "tip.trampoline",
    zip: "tip.zip",
    mover: "tip.mover",
    wind: "tip.wind",
    seesaw: "tip.seesaw",
    drop: "tip.drop",
    ghost: "tip.ghost",
    ijenni: "tip.ijenni",
    teryel: "tip.trap",
    slide: "tip.slide",
    knock: "tip.knock",
    raven: "tip.raven",
    oil: "tip.oil",
    wheel: "tip.wheel",
    rat: "tip.rat",
  };
  // Short lines during play, by event: text ids, one picked at random.
  const remarks = {
    firstSmash: ["r.firstSmash"],
    smashAll: ["r.smashAll"],
    death: ["r.death", "r.deathAgain"],
    deathThird: ["r.deathThird"],
    crush: ["r.crush"],
    web: ["r.web"],
    boing: ["r.boing"],
    zip: ["r.zip"],
    trap: ["r.trap"],
    slide: ["r.slide"],
    knock: ["r.knock"],
    oil: ["r.oil"],
    wheel: ["r.wheel"],
  };
  return { opening, firstNight, closing, tales, tips, remarks };
});
