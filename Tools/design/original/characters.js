/* Character design sheet for Mqidec: five outfit variants, one shared animation state. */
(function () {
  "use strict";
  const Art = globalThis.HNOriginalArt;
  const $ = (id) => document.getElementById(id);

  const designs = [
    {
      name: "Original",
      blurb: "Your rabbit as it is. The reference for everything else.",
      outfit: {},
    },
    {
      name: "Abernus aqehwi",
      blurb:
        "The burnous simulated as real cloth in Blender and rendered with wool shading and your sprite's lighting, then composited over the rabbit: felted brown wool, open in front, the hood on the back when idle and snug on the head with the ears through it when hunted, the hem blown back in flight.",
      outfit: { figure: "sim", glyphs: true },
    },
    {
      name: "Abernus (drawn)",
      blurb: "The previous code-painted version, kept for comparison.",
      outfit: { figure: "mqidec", color: "brown", glyphs: true },
    },
    {
      name: "Ticrad",
      blurb:
        "No cloak. Only the marks men carried for protection and healing, cut faintly into the fur: the chain with two flies on the brow, a dot on each cheek, a small mark on the paw. His dash writes ⵎⵇⵉⴷⴻⵛ behind him.",
      outfit: { ticrad: "full", glyphs: true },
    },
  ];

  const states = [
    { key: "idle", label: "Idle" },
    { key: "hunted", label: "Hunted" },
    { key: "aim", label: "Aiming" },
    { key: "fly", label: "Flight" },
    { key: "dash", label: "Dash" },
    { key: "land", label: "Landing" },
    { key: "cycle", label: "Cycle all" },
  ];
  let state = "cycle";
  let chosen = null;
  try {
    chosen = localStorage.getItem("hn-mqidec-choice");
  } catch (error) {
    console.warn(error.message);
  }

  const stateBox = $("states");
  for (const s of states) {
    const b = document.createElement("button");
    b.textContent = s.label;
    b.setAttribute("aria-pressed", String(s.key === state));
    b.addEventListener("click", () => {
      state = s.key;
      for (const other of stateBox.children) other.setAttribute("aria-pressed", String(other === b));
    });
    stateBox.append(b);
  }

  const cards = [];
  designs.forEach((d, i) => {
    const card = document.createElement("article");
    card.className = "card" + (chosen === String(i + 1) ? " chosen" : "");
    const h = document.createElement("h2");
    const num = document.createElement("span");
    num.className = "num";
    num.textContent = i + 1;
    h.append(num, d.name);
    const canvas = document.createElement("canvas");
    const p = document.createElement("p");
    p.textContent = d.blurb;
    const b = document.createElement("button");
    b.textContent = "Choose " + (i + 1);
    b.addEventListener("click", () => {
      chosen = String(i + 1);
      try {
        localStorage.setItem("hn-mqidec-choice", chosen);
      } catch (error) {
        console.warn(error.message);
      }
      for (const c of cards) c.el.classList.toggle("chosen", c.index === i);
    });
    card.append(h, canvas, p, b);
    $("cards").append(card);
    cards.push({ el: card, canvas, design: d, index: i, ctx: canvas.getContext("2d") });
  });

  function poseFor(key, t) {
    const k = t % 1;
    switch (key) {
      case "hunted":
        return { state: "resting", hunted: true, look: { x: Math.sin(t * 5) * 0.6, y: -0.2 }, blink: 0 };
      case "aim":
        return { state: "resting", aim: 2.6, look: { x: 0.8, y: -0.8 } };
      case "fly":
        return { state: "flying", vx: 7, vy: Math.cos(t * 2) * 9 };
      case "dash":
        return { state: "flying", vx: 13, vy: 3, dash: true };
      case "land":
        return { state: "resting", landed: Math.max(0, 1 - k * 2.5) };
      default:
        return { state: "resting" };
    }
  }
  function currentKey(t) {
    if (state !== "cycle") return state;
    const order = ["idle", "hunted", "aim", "fly", "dash", "land"];
    return order[Math.floor(t / 2.2) % order.length];
  }

  function frame(now) {
    const t = now / 1000;
    const key = currentKey(t);
    for (const c of cards) {
      const rect = c.canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (c.canvas.width !== Math.round(rect.width * dpr)) {
        c.canvas.width = Math.round(rect.width * dpr);
        c.canvas.height = Math.round(rect.height * dpr);
      }
      const ctx = c.ctx;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);
      const size = rect.width * 0.58;
      const pose = poseFor(key, t);
      let y = rect.height * 0.6;
      if (key === "fly" || key === "dash") y -= rect.height * 0.08 + Math.sin(t * 2) * rect.height * 0.05;
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.beginPath();
      ctx.ellipse(rect.width / 2, rect.height * 0.86, size * 0.42, size * 0.09, 0, 0, Math.PI * 2);
      ctx.fill();
      const figure = c.design.outfit.figure;
      const draw = figure === "sim" ? Art.mqidecSim : figure === "mqidec" ? Art.mqidec : Art.rabbit;
      draw(ctx, rect.width / 2, y, size, { time: t, id: c.index, outfit: c.design.outfit, ...pose });
      ctx.fillStyle = "rgba(220,228,240,0.7)";
      ctx.font = "12px system-ui, sans-serif";
      ctx.fillText(states.find((s) => s.key === key).label, 10, rect.height - 10);
    }
    requestAnimationFrame(frame);
  }

  Art.load("assets/")
    .then(() => requestAnimationFrame(frame))
    .catch((error) => {
      $("cards").textContent = error.message;
    });
})();
