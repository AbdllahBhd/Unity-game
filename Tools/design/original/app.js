/* The tales of Mqidec: nights flow, languages, input, camera, teaching, sound. */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const Art = globalThis.HNOriginalArt;
  const Tales = globalThis.HNTalesArt;
  const Levels = globalThis.HNOriginalLevels;
  const Story = globalThis.HNStory;
  const TEXT = globalThis.HNText;
  const Sfx = globalThis.HNSfx;
  const { Game, launchVelocity } = globalThis.HNGame;
  const canvas = $("canvas");
  const ctx = canvas.getContext("2d");
  const STEP = 1 / 120;
  const TYPE_SPEED = 42; // characters per second on story screens
  const LANGS = [
    ["tq", "Taqbaylit"],
    ["fr", "Français"],
    ["ar", "العربية"],
    ["en", "English"],
  ];

  /* ---------- Saved progress (per browser; the game works without it) ---------- */
  const SAVE_KEY = "hn-mqidec-tales";
  const save = { stars: {}, seen: {}, tips: {}, muted: false, lang: "" };
  const plain = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
  try {
    const stored = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
    if (plain(stored)) {
      if (plain(stored.stars))
        for (const [id, value] of Object.entries(stored.stars))
          if (Number.isInteger(value)) save.stars[id] = Math.max(0, Math.min(3, value));
      if (plain(stored.seen)) save.seen = stored.seen;
      if (plain(stored.tips)) save.tips = stored.tips;
      save.muted = stored.muted === true;
      if (LANGS.some(([k]) => k === stored.lang)) save.lang = stored.lang;
    }
  } catch (error) {
    console.warn("Progress could not be read; starting fresh.", error.message);
  }
  if (!save.lang) {
    const nav = (navigator.language || "en").toLowerCase();
    save.lang = nav.startsWith("kab") ? "tq" : nav.startsWith("fr") ? "fr" : nav.startsWith("ar") ? "ar" : "en";
  }
  function persist() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    } catch (error) {
      console.warn("Progress will last only for this visit.", error.message);
    }
  }

  /* ---------- Text ---------- */
  function T(id, vars) {
    const entry = TEXT[id];
    let s = entry ? entry[save.lang] || entry.en : id;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace("{" + k + "}", v);
    return s;
  }
  const TQ = (id) => (TEXT[id] ? TEXT[id].tq : id); // names stay in Taqbaylit
  function applyLang() {
    document.documentElement.lang = save.lang === "tq" ? "kab" : save.lang;
    document.documentElement.dir = save.lang === "ar" ? "rtl" : "ltr";
    for (const el of document.querySelectorAll("[data-t]")) el.textContent = T(el.dataset.t);
    for (const el of document.querySelectorAll("[data-t-label]")) el.setAttribute("aria-label", T(el.dataset.tLabel));
    for (const sel of document.querySelectorAll(".lang-select")) sel.value = save.lang;
    applyMute();
    if (mode === "map") toMap();
    if (mode === "story") renderBeat(false, true);
    if (mode === "stage" && game) stageLabels();
    if (tip) $("tip-text").textContent = T(Story.tips[tip.kind]);
  }
  for (const sel of document.querySelectorAll(".lang-select")) {
    for (const [key, name] of LANGS) {
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = name;
      sel.append(opt);
    }
    sel.addEventListener("change", () => {
      save.lang = sel.value;
      persist();
      applyLang();
    });
  }

  /* ---------- Sound ---------- */
  function sound(name, opts) {
    if (Sfx) Sfx.play(name, opts);
  }
  // The ambience bed follows the place on screen.
  function place(name) {
    if (!Sfx || !Sfx.setPlace) return;
    const p = name.startsWith("kitchen")
      ? "kitchen"
      : name.startsWith("loom")
        ? "loom"
        : name.startsWith("citadel") || name === "roofs" || name === "roof"
          ? "roofs"
          : name.startsWith("press")
            ? "press"
          : name.startsWith("gorge") || name === "home"
            ? "gorge"
            : "hearth";
    Sfx.setPlace(p);
  }
  function applyMute() {
    if (Sfx) Sfx.setMuted(save.muted);
    for (const button of document.querySelectorAll(".mute")) {
      button.setAttribute("aria-pressed", String(save.muted));
      button.textContent = T(save.muted ? "ui.soundOff" : "ui.soundOn");
    }
  }
  // Unlock on every touch and when the tab returns; a browser can leave audio suspended.
  function wakeAudio() {
    if (!Sfx) return;
    Sfx.unlock();
    applyMute();
    Sfx.ambience(true);
  }
  document.addEventListener("pointerdown", wakeAudio);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) wakeAudio();
  });
  for (const button of document.querySelectorAll(".mute"))
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      save.muted = !save.muted;
      persist();
      applyMute();
      sound("tap");
    });

  /* ---------- Canvas sizing ---------- */
  let W = 0,
    H = 0;
  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    W = rect.width;
    H = rect.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resize);

  /* ---------- Screens ---------- */
  let mode = "title";
  const screens = ["title-screen", "map-screen", "story-screen", "stage-screen"];
  function show(id) {
    for (const s of screens) $(s).hidden = s !== id;
    $("pause-panel").hidden = true;
    $("result-panel").hidden = true;
    $("tip").hidden = true;
  }
  let sceneName = "hearth",
    sceneTime = 0,
    sceneFlash = 0;
  function toTitle() {
    mode = "title";
    place("hearth");
    sceneName = "hearth";
    sceneTime = 0;
    show("title-screen");
  }
  function toMap() {
    mode = "map";
    place("hearth");
    sceneName = "hearth";
    show("map-screen");
    const box = $("chapters");
    box.textContent = "";
    let total = 0;
    for (const tale of Levels.tales) {
      const section = document.createElement("section");
      section.className = "chapter";
      const heading = document.createElement("h3");
      heading.textContent = `${T("ui.night")} ${tale.id} · ${TQ("tale." + tale.id)}`;
      if (save.lang !== "tq") {
        const sub = document.createElement("span");
        sub.className = "sub";
        sub.textContent = T("tale." + tale.id);
        heading.append(sub);
      }
      const grid = document.createElement("div");
      grid.className = "stage-grid";
      for (const stage of Levels.all.filter((s) => s.tale === tale.id)) {
        const earned = save.stars[stage.id] || 0;
        total += earned;
        const button = document.createElement("button");
        button.className = "stage-button";
        button.setAttribute("aria-label", `${T("ui.stage")} ${stage.id}, ${T("stage." + stage.id)}, ${earned}/3`);
        const num = document.createElement("span");
        num.className = "num";
        num.textContent = stage.id;
        const name = document.createElement("span");
        name.className = "name";
        name.textContent = TQ("stage." + stage.id);
        const sub = document.createElement("span");
        sub.className = "sub";
        if (save.lang !== "tq") sub.textContent = T("stage." + stage.id);
        const mini = document.createElement("span");
        mini.className = "mini";
        for (let i = 0; i < 3; i++) {
          const star = document.createElement("img");
          star.src = "assets/star.png";
          star.alt = "";
          if (i < earned) star.className = "on";
          mini.append(star);
        }
        button.append(num, name, sub, mini);
        button.addEventListener("click", () => {
          sound("tap");
          openStage(stage.id);
        });
        grid.append(button);
      }
      section.append(heading, grid);
      box.append(section);
    }
    $("star-total").textContent = `${total} / ${Levels.count * 3}`;
  }

  /* ---------- Story screens ---------- */
  let beats = [],
    beatIndex = 0,
    lineIndex = 0,
    afterStory = null,
    storyStarted = 0,
    storyKeys = [],
    lineShown = 0,
    lineText = "",
    typed = -1,
    lineDone = 0,
    speakerNow = "",
    moodNow = "";
  // keys: marked as seen only once the story ends (finished or skipped).
  function playStory(list, then, card, keys = []) {
    if (!list || !list.length) {
      then();
      return;
    }
    mode = "story";
    beats = list;
    beatIndex = 0;
    lineIndex = 0;
    storyKeys = keys;
    storyStarted = performance.now();
    afterStory = () => {
      for (const k of storyKeys) save.seen[k] = true;
      persist();
      then();
    };
    show("story-screen");
    const el = $("chapter-card");
    el.hidden = !card;
    if (card) {
      el.textContent = "";
      const small = document.createElement("small");
      small.textContent = card.kicker;
      el.append(small, card.title);
      if (card.sub) {
        const sub = document.createElement("small");
        sub.textContent = card.sub;
        el.append(sub);
      }
    }
    renderBeat(true);
  }
  function renderBeat(newBeat, keepTyping) {
    const beat = beats[beatIndex];
    if (sceneName !== beat.scene) sceneTime = 0;
    sceneName = beat.scene;
    place(sceneName);
    const id = beat.lines[lineIndex];
    const entry = TEXT[id] || { who: "", mood: "" };
    speakerNow = entry.who;
    moodNow = entry.mood;
    const speaker = $("speaker");
    speaker.textContent = entry.who ? T("who." + entry.who) : "";
    speaker.className = "speaker " + entry.who;
    $("portrait").classList.toggle("empty", !entry.who);
    $("line").className = "line" + (entry.who ? "" : " narration");
    lineText = T(id);
    if (keepTyping) {
      typed = lineText.length;
      $("line").textContent = lineText;
      return;
    }
    typed = 0;
    lineShown = performance.now();
    $("line").textContent = "";
    if (newBeat && beat.fx === "thud") {
      sceneFlash = 0.5;
      sound("crush");
    } else if (newBeat && beat.fx === "wind") sound("dash", { pitch: 0.5, volume: 0.5 });
    else sound("page", { volume: 0.5 });
  }
  function advanceStory() {
    const now = performance.now();
    if (now - storyStarted < 300 || now - lineDone < 250) return;
    if (typed >= 0 && typed < lineText.length) {
      typed = lineText.length;
      lineDone = now;
      $("line").textContent = lineText;
      return;
    }
    const beat = beats[beatIndex];
    if (lineIndex < beat.lines.length - 1) {
      lineIndex++;
      renderBeat(false);
    } else if (beatIndex < beats.length - 1) {
      beatIndex++;
      lineIndex = 0;
      $("chapter-card").hidden = true;
      renderBeat(true);
    } else afterStory();
  }
  function typeLine(dt) {
    if (typed < 0 || typed >= lineText.length) return;
    typed = Math.min(lineText.length, typed + dt * TYPE_SPEED);
    if (typed >= lineText.length) lineDone = performance.now();
    $("line").textContent = lineText.slice(0, Math.floor(typed));
  }

  /* ---------- Nights: which story plays before and after a stage ---------- */
  function openStage(id) {
    const tale = Levels.taleOf(id);
    const list = [],
      keys = [];
    let card = null;
    if (!save.seen["night" + tale]) {
      list.push(...Story.opening);
      if (tale === 1 && !save.seen.firstNight) {
        list.push(...Story.firstNight);
        keys.push("firstNight");
      }
      list.push(...Story.tales[tale].intro);
      keys.push("night" + tale);
      card = { kicker: `${T("ui.night")} ${tale}`, title: TQ("tale." + tale), sub: save.lang === "tq" ? "" : T("tale." + tale) };
    }
    if (!save.seen["stage" + id]) {
      list.push(...Story.tales[tale].stages[id]);
      keys.push("stage" + id);
    }
    playStory(list, () => startStage(id), card, keys);
  }
  function nextStage() {
    const id = stageId;
    const tale = Levels.taleOf(id);
    const lastOfTale = id % 4 === 0;
    const goOn = () => (id === Levels.count ? toTitle() : openStage(id + 1));
    if (lastOfTale && !save.seen["end" + tale])
      playStory([...Story.tales[tale].end, ...Story.closing], goOn, null, ["end" + tale]);
    else goOn();
  }

  /* ---------- Stage ---------- */
  let game = null,
    stageId = 1,
    events = [],
    fx = new Art.Effects(),
    camY = 0,
    camKick = 0,
    drag = null,
    aim = null,
    paused = false,
    doorOpen = 0,
    entering = -1,
    shake = 0,
    flash = 0,
    whiteFlash = 0,
    hitStop = 0,
    landed = 0,
    acc = 0,
    launchedOnce = false,
    remarked = {},
    deathCount = 0,
    tipQueue = [],
    tip = null,
    teryelVoice = 0;
  const NOTICE_SOUND = { pot: ["clink", 1], spider: ["snap", 1.6], ijenni: ["whisper", 1], raven: ["caw", 1], rat: ["squeak", 1] };

  function stageLabels() {
    $("stage-number").textContent = `${T("ui.night")} ${Levels.taleOf(stageId)} · ${T("ui.stage")} ${stageId}`;
    $("stage-name").textContent = TQ("stage." + stageId) + (save.lang === "tq" ? "" : ` · ${T("stage." + stageId)}`);
  }
  function startStage(id) {
    stageId = id;
    const level = Levels.get(id);
    game = new Game(level, { pursuit: "aim", hunters: "lively" });
    events = [];
    const emit = game.emit.bind(game);
    game.emit = (type, extra = {}) => {
      events.push({ type, ...extra });
      emit(type, extra);
    };
    fx = new Art.Effects();
    camY = cameraTarget(level.start.y, level);
    camKick = 0;
    drag = aim = null;
    paused = false;
    doorOpen = 0;
    entering = -1;
    shake = flash = whiteFlash = hitStop = landed = acc = 0;
    launchedOnce = false;
    remarked = {};
    deathCount = 0;
    tip = null;
    mode = "stage";
    place(level.theme);
    teryelVoice = 1.5;
    show("stage-screen");
    stageLabels();
    updateStars();
    queueTips(level);
    if (tipQueue.length) showTip();
  }
  // Keeps Mqidec in the lower third with a strip of floor under the start.
  function cameraTarget(heroY, level) {
    const visible = H / (W / 12);
    const floor = -1.6;
    const ceiling = Math.max(floor, level.height - visible + 2.5);
    return Math.max(floor, Math.min(heroY - visible * 0.36, ceiling));
  }
  function updateStars() {
    const lit = game ? game.smashed() : 0;
    [...$("hud-stars").children].forEach((star, i) => star.classList.toggle("on", i < lit));
    $("hud-stars").setAttribute("aria-label", `${lit}/3`);
  }

  /* ---------- Teaching cards ---------- */
  function queueTips(level) {
    tipQueue = [];
    const add = (kind, x, y, r) => {
      if (save.tips[kind] || tipQueue.some((t) => t.kind === kind) || !Story.tips[kind]) return;
      tipQueue.push({ kind, x, y, r });
    };
    if (level.id === 1) add("launch", level.start.x, level.start.y, 1.4);
    const hunter = level.pumpkins.find((p) => p.range > 0 && !p.roll);
    if (hunter) add(["ijenni", "raven", "rat"].includes(level.hunter) ? level.hunter : "hunter", hunter.x, hunter.y, 1.3);
    if (level.id >= 2) add("dash", level.start.x, level.start.y, 1.4);
    for (const p of level.platforms) {
      if (p.oil) add("oil", p.x, p.y, p.w / 2 + 0.6);
      if (p.type === "wheel") add("wheel", p.cx, p.cy, p.radius + 0.9);
      else if (p.type === "slope") add("slide", p.x, (p.y1 + p.y2) / 2, p.w / 2 + 0.6);
      else if (p.type === "drop" && p.knock) add("knock", p.x, p.y, 1.4);
      else if (["seesaw", "mover", "drop", "ghost"].includes(p.type)) add(p.type, p.x, p.y, p.w / 2 + 0.8);
    }
    for (const o of level.objects) {
      const kind = o.type === "cannon" ? "cannon" : o.type;
      if (Story.tips[kind]) add(kind, o.x, o.y, o.type === "zip" ? 2.4 : o.type === "teryel" ? (o.r || 1) + 1 : 1.4);
    }
    const roll = level.pumpkins.find((p) => p.roll);
    if (roll) add("roll", roll.x, roll.y, 1.3);
  }
  function showTip() {
    tip = tipQueue.shift();
    if (!tip) {
      $("tip").hidden = true;
      return;
    }
    tip.alpha = 0;
    $("tip").hidden = false;
    $("tip-text").textContent = T(Story.tips[tip.kind]);
    const gesture = { launch: "drag", dash: "tap", ijenni: "tap", seesaw: "drop" }[tip.kind] || "none";
    $("tip-hand").className = "tip-hand " + gesture;
    $("tip-hand").hidden = gesture === "none";
    sound("notice", { volume: 0.6 });
  }
  function dismissTip() {
    if (!tip) return;
    save.tips[tip.kind] = true;
    persist();
    sound("tap");
    tip = null;
    showTip();
  }
  $("tip-ok").addEventListener("click", (event) => {
    event.stopPropagation();
    dismissTip();
  });
  $("tip").addEventListener("click", dismissTip);

  /* ---------- Remarks and toasts ---------- */
  let toastTimer = 0;
  function toast(text, who) {
    const el = $("toast");
    el.textContent = "";
    if (who) {
      const name = document.createElement("span");
      name.className = "who";
      name.textContent = T("who." + who);
      el.append(name);
    }
    el.append(text);
    el.classList.toggle("owl-says", Boolean(who));
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), who ? 2200 : 1300);
  }
  function remark(key) {
    if (remarked[key]) return;
    remarked[key] = true;
    const ids = Story.remarks[key];
    if (!ids) return;
    const id = ids[Math.floor(Math.random() * ids.length)];
    toast(T(id), TEXT[id] ? TEXT[id].who : "jida");
  }

  function handleEvents() {
    for (const e of events) {
      const at = { x: e.x === undefined ? game.hero.x : e.x, y: e.y === undefined ? game.hero.y : e.y };
      if (e.type === "smash") {
        fx.burst(at.x, at.y);
        shake = Math.max(shake, 0.25);
        hitStop = 0.07;
        camKick = 0.2;
        whiteFlash = 0.18;
        sound(e.crushed ? "crush" : "smash");
        sound("star", { index: Math.min(2, game.smashed() - 1), volume: 0.6 });
        updateStars();
        if (game.smashed() === 3) remark("smashAll");
        else if (e.crushed) remark("crush");
        else remark("firstSmash");
      } else if (e.type === "death") {
        flash = 0.9;
        shake = 0.35;
        drag = aim = null;
        deathCount++;
        sound("death");
        if (deathCount >= 3) {
          remarked.deathThird = false;
          remark("deathThird");
        } else remark("death");
      } else if (e.type === "trapped") {
        shake = 0.6;
        whiteFlash = 0.3;
        sound("bossdown");
        toast(T("ui.trapped"));
        setTimeout(() => {
          if (mode === "stage") remark("trap");
        }, 1400);
      } else if (e.type === "launch") sound("launch");
      else if (e.type === "dash") sound("dash");
      else if (e.type === "web") {
        fx.silk(at.x, at.y);
        sound("web");
        remark("web");
      } else if (e.type === "tear") {
        fx.silk(at.x, at.y);
        sound("snap", { volume: 0.5 });
      } else if (e.type === "boing") {
        fx.silk(at.x, at.y);
        shake = Math.max(shake, 0.12);
        sound("boing");
        remark("boing");
      } else if (e.type === "zip") {
        sound("zip");
        remark("zip");
      } else if (e.type === "zip-off") sound("dash", { volume: 0.5, pitch: 0.8 });
      else if (e.type === "land") {
        fx.dust(at.x, at.y - 0.45);
        landed = 1;
        sound("land", { volume: 0.5 });
        if (game.support && game.support.type === "wheel") {
          sound("creak", { volume: 0.5, pitch: 1.2 });
          // "Up he goes!" only on a plank that is rising.
          if (game.support.y > game.support.previousY) remark("wheel");
        }
      } else if (e.type === "snap") sound("snap");
      else if (e.type === "thud") {
        shake = Math.max(shake, 0.3);
        fx.dust(at.x, at.y);
        sound("crush", { volume: 0.7, pitch: 0.8 });
      } else if (e.type === "seesaw") {
        shake = Math.max(shake, 0.2);
        fx.dust(at.x, at.y);
        sound("seesaw");
      } else if (e.type === "roll") sound("roll");
      else if (e.type === "gust") sound("zip", { pitch: 0.6, volume: 0.6 });
      else if (e.type === "slide") {
        sound("roll", { pitch: 1.6, volume: 0.6 });
        remark("slide");
      } else if (e.type === "hop") sound("dash", { pitch: 0.9, volume: 0.6 });
      else if (e.type === "oil") {
        sound("roll", { pitch: 2.2, volume: 0.5 });
        fx.dust(at.x, at.y);
        remark("oil");
      }
      else if (e.type === "knock") {
        sound("clink", { pitch: 0.7 });
        sound("crush", { volume: 0.4, pitch: 1.3 });
        fx.dust(at.x, at.y);
        remark("knock");
      }
      else if (e.type === "notice") {
        const [name, pitch] = NOTICE_SOUND[game.level.hunter] || ["notice", 1];
        sound(name, { volume: 0.6, pitch });
      }
      else if (e.type === "cannon") {
        fx.sparks(at.x, at.y, "rgba(255,170,80,", 10);
        sound("web", { pitch: 0.5, volume: 0.6 });
      } else if (e.type === "fire") {
        fx.sparks(at.x, at.y, "rgba(255,170,80,", 10);
        sound("launch", { pitch: 0.7 });
      } else if (e.type === "win") {
        entering = 0;
        drag = aim = null;
        sound("door");
      }
    }
    events = [];
  }

  function finishStage() {
    const smashed = game.smashed();
    save.stars[stageId] = Math.max(save.stars[stageId] || 0, smashed);
    persist();
    mode = "result";
    $("result-panel").hidden = false;
    const box = $("result-stars");
    box.textContent = "";
    for (let i = 0; i < 3; i++) {
      const star = document.createElement("img");
      star.src = "assets/star.png";
      star.alt = "";
      if (i < smashed) {
        star.className = "on";
        star.style.animationDelay = `${0.25 + i * 0.3}s`;
        setTimeout(() => sound("star", { index: i }), 250 + i * 300);
      }
      box.append(star);
    }
    $("result-title").textContent = T("ui.doorOpens");
    $("result-line").textContent =
      smashed === 3 ? T("ui.allThree") : smashed === 0 ? T("ui.noneBroken") : T("ui.someBroken", { n: smashed });
  }

  /* ---------- Input ---------- */
  const unitsPerPixel = () => 12 / W;
  canvas.addEventListener("pointerdown", (event) => {
    if (mode !== "stage" || paused || tip || !game || game.won || drag) return;
    canvas.setPointerCapture(event.pointerId);
    if (game.hero.state === "flying" || game.hero.state === "zip" || game.hero.state === "slide") {
      game.dash();
      return;
    }
    if (game.hero.state !== "resting") return;
    drag = { x: event.clientX, y: event.clientY, id: event.pointerId };
    aim = null;
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    const u = unitsPerPixel();
    let dx = (drag.x - event.clientX) * u,
      dy = (event.clientY - drag.y) * u;
    const length = Math.hypot(dx, dy);
    if (length > 4) {
      dx *= 4 / length;
      dy *= 4 / length;
    }
    aim = length < 0.45 ? null : launchVelocity(dx, dy);
    // Hunters freeze only while a real aim is held, not under a resting finger.
    game.setAim(Boolean(aim));
  });
  function release(event, cancel) {
    if (!drag || drag.id !== event.pointerId) return;
    game.setAim(false);
    if (!cancel && aim && game.hero.state === "resting" && game.launch(aim.x, aim.y)) launchedOnce = true;
    drag = aim = null;
  }
  canvas.addEventListener("pointerup", (event) => release(event, false));
  canvas.addEventListener("pointercancel", (event) => release(event, true));
  $("story-screen").addEventListener("click", (event) => {
    if (!event.target.closest("button")) advanceStory();
  });
  $("skip").addEventListener("click", (event) => {
    event.stopPropagation();
    sound("tap");
    afterStory();
  });
  window.addEventListener("keydown", (event) => {
    if (mode === "story" && (event.key === " " || event.key === "Enter")) {
      event.preventDefault();
      advanceStory();
    } else if (mode === "stage") {
      if (tip && (event.key === " " || event.key === "Enter")) {
        event.preventDefault();
        dismissTip();
      } else if (event.key === "r" || event.key === "R") startStage(stageId);
      else if (event.key === "Escape") setPaused(!paused);
      else if (event.key === " ") {
        event.preventDefault();
        if (game.hero.state === "flying" || game.hero.state === "zip" || game.hero.state === "slide") game.dash();
      }
    }
  });
  function setPaused(value) {
    if (mode !== "stage") return;
    paused = value;
    $("pause-panel").hidden = !paused;
    if (paused) {
      drag = aim = null;
      game.setAim(false);
    }
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) setPaused(true);
  });
  const click = (id, handler) =>
    $(id).addEventListener("click", () => {
      sound("tap");
      handler();
    });
  click("play", () => {
    const next = Levels.all.find((s) => save.stars[s.id] === undefined);
    openStage(next ? next.id : 1);
  });
  click("open-map", toMap);
  click("map-back", toTitle);
  click("pause", () => setPaused(true));
  click("restart", () => startStage(stageId));
  click("resume", () => setPaused(false));
  click("pause-restart", () => startStage(stageId));
  click("pause-map", toMap);
  click("result-map", toMap);
  click("result-restart", () => startStage(stageId));
  click("result-next", nextStage);

  /* ---------- Frame loop ---------- */
  const portraitCtx = $("portrait").getContext("2d");
  const tipCtx = $("tip-portrait").getContext("2d");
  let last = 0;
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    if (mode === "stage" || mode === "result") stageFrame(dt);
    else {
      sceneTime += dt;
      sceneFlash = Math.max(0, sceneFlash - dt * 2.2);
      if (mode === "story") {
        typeLine(dt);
        if (speakerNow) Tales.portrait(portraitCtx, speakerNow, moodNow, 192, sceneTime);
      }
      ctx.clearRect(0, 0, W, H);
      Tales.scene(ctx, sceneName, W, H, sceneTime, {
        speaker: mode === "story" ? speakerNow : "",
        mood: mode === "story" ? moodNow : "",
        lineAge: mode === "story" ? (performance.now() - lineShown) / 1000 : 9,
        flash: sceneFlash,
      });
    }
    if (tip) Tales.portrait(tipCtx, "jida", "telling", 160, now / 1000);
    requestAnimationFrame(frame);
  }

  function stageFrame(dt) {
    const running = !paused && mode === "stage" && !tip;
    if (running) {
      if (entering < 0) {
        if (hitStop > 0) hitStop -= dt;
        else {
          acc += dt;
          while (acc >= STEP) {
            game.step(STEP);
            acc -= STEP;
          }
        }
        handleEvents();
        teryelVoice -= dt;
        if (teryelVoice <= 0) {
          const near = game.objects.find(
            (o) => o.type === "teryel" && !o.trapped && Math.hypot(o.x - game.hero.x, o.y - game.hero.y) < (o.r || 1) + 3.5,
          );
          if (near) {
            const asleep = !near.dx && !near.dy;
            sound(asleep ? "snore" : "growl", { volume: 0.7, pitch: asleep ? 1 : 0.9 + Math.random() * 0.2 });
            teryelVoice = asleep ? 2.8 : 3.5;
          } else teryelVoice = 0.5;
        }
        if (drag && game.hero.state !== "resting") {
          game.setAim(false);
          drag = aim = null;
        }
      } else {
        entering += dt * 12;
        if (entering >= 14) finishStage();
      }
      fx.update(dt);
    }
    shake = Math.max(0, shake - dt);
    flash = Math.max(0, flash - dt);
    whiteFlash = Math.max(0, whiteFlash - dt * 1.5);
    camKick = Math.max(0, camKick - dt);
    landed = Math.max(0, landed - dt * 5);
    const snap = game.snapshot();
    snap.platforms = game.platforms;
    const d = game.level.door;
    const near = Math.hypot(game.hero.x - d.x, game.hero.y - d.y) < 3.4;
    doorOpen += ((near && !snap.sealed ? 1 : 0) - doorOpen) * Math.min(1, dt * 8);
    if (tip) {
      tip.alpha = Math.min(1, tip.alpha + dt * 3);
      const visible = H / (W / 12);
      const target = Math.max(-1.6, Math.min(tip.y - visible * 0.5, game.level.height - visible + 2.5));
      camY += (target - camY) * Math.min(1, dt * 4);
    } else camY += (cameraTarget(game.hero.y, game.level) - camY) * Math.min(1, dt * 4);
    ctx.save();
    ctx.clearRect(0, 0, W, H);
    if (shake > 0) ctx.translate(Math.sin(performance.now() * 0.09) * shake * 10, 0);
    if (camKick > 0) ctx.translate(0, Math.sin(camKick * 30) * camKick * 18);
    Art.drawStage(ctx, snap, {
      width: W,
      height: H,
      cameraY: camY,
      chapter: game.level.chapter,
      theme: Tales,
      lamp: game.level.tale === 3,
      aim: drag && aim ? aim : null,
      fx,
      hidden: entering >= 0,
      doorFrame: entering >= 0 ? 5 : Math.round(doorOpen * 5),
      enterFrame: entering >= 0 ? Math.min(11, Math.floor(entering)) : undefined,
      hand: stageId === 1 && !launchedOnce && !drag && !tip,
      flash: flash > 0,
      whiteFlash,
      landed,
      focus: tip ? tip : null,
      showRings: !launchedOnce,
    });
    ctx.restore();
  }

  /* ---------- Boot ---------- */
  resize();
  applyLang();
  Art.load("assets/")
    .then(() => {
      $("loading").hidden = true;
      toTitle();
      requestAnimationFrame(frame);
    })
    .catch((error) => {
      $("loading").textContent = error.message;
      console.error(error);
    });
})();
