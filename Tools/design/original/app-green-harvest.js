/* The Green Harvest: screen flow, input, camera, teaching, sound and effects. */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const Art = globalThis.HNOriginalArt;
  const Levels = globalThis.HNOriginalLevels;
  const Story = globalThis.HNStory;
  const Sfx = globalThis.HNSfx;
  const { Game, launchVelocity } = globalThis.HNGame;
  const canvas = $("canvas");
  const ctx = canvas.getContext("2d");
  const STEP = 1 / 120;
  const ROMAN = ["I", "II", "III"];
  const TYPE_SPEED = 42; // characters per second on story screens

  /* ---------- Saved progress (per browser; the game works without it) ---------- */
  const SAVE_KEY = "hn-green-harvest";
  let save = { stars: {}, seen: {}, tips: {}, muted: false };
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
    }
  } catch (error) {
    console.warn("Progress could not be read; starting fresh.", error.message);
  }
  function persist() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    } catch (error) {
      console.warn("Progress will last only for this visit.", error.message);
    }
  }

  /* ---------- Sound ---------- */
  function sound(name, opts) {
    if (Sfx) Sfx.play(name, opts);
  }
  function applyMute() {
    if (Sfx) Sfx.setMuted(save.muted);
    for (const button of document.querySelectorAll(".mute")) {
      button.setAttribute("aria-pressed", String(save.muted));
      button.textContent = save.muted ? "Sound off" : "Sound on";
    }
  }
  // Unlock on every touch and when the tab returns: a browser can leave the context
  // suspended after the first gesture (calls, backgrounding), and unlock is idempotent.
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
  applyMute();

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

  /* ---------- Title and map ---------- */
  let sceneName = "graveyard",
    sceneTime = 0,
    sceneFlash = 0;
  function toTitle() {
    mode = "title";
    sceneName = "chase";
    sceneTime = 0;
    show("title-screen");
  }
  function toMap() {
    mode = "map";
    sceneName = "graveyard";
    show("map-screen");
    const box = $("chapters");
    box.textContent = "";
    let total = 0;
    Story.chapters.forEach((title, chapter) => {
      const section = document.createElement("section");
      section.className = "chapter";
      const heading = document.createElement("h3");
      heading.textContent = `Chapter ${ROMAN[chapter]} · ${title}`;
      const grid = document.createElement("div");
      grid.className = "stage-grid";
      for (const stage of Levels.all.filter((s) => Levels.chapterOf(s.id) === chapter)) {
        const earned = save.stars[stage.id] || 0;
        total += earned;
        const button = document.createElement("button");
        button.className = "stage-button";
        button.setAttribute(
          "aria-label",
          `Stage ${stage.id}, ${stage.name}, ${save.stars[stage.id] === undefined ? "not finished" : earned + " of 3 stars"}`,
        );
        const num = document.createElement("span");
        num.className = "num";
        num.textContent = stage.id;
        const name = document.createElement("span");
        name.className = "name";
        name.textContent = stage.name;
        const mini = document.createElement("span");
        mini.className = "mini";
        for (let i = 0; i < 3; i++) {
          const star = document.createElement("img");
          star.src = "assets/star.png";
          star.alt = "";
          if (i < earned) star.className = "on";
          mini.append(star);
        }
        button.append(num, name, mini);
        button.addEventListener("click", () => {
          sound("tap");
          openStage(stage.id);
        });
        grid.append(button);
      }
      section.append(heading, grid);
      box.append(section);
    });
    $("star-total").textContent = `${total} / ${Levels.count * 3}`;
  }

  /* ---------- Story ---------- */
  let beats = [],
    beatIndex = 0,
    lineIndex = 0,
    afterStory = null,
    storyStarted = 0,
    storyKey = null,
    lineShown = 0,
    lineText = "",
    typed = -1,
    lineDone = 0;
  const SPEAKERS = { owl: "The Owl", pumpkin: "A green pumpkin", weaver: "The Weaver" };
  // key: marked as seen only once the story ends (finished or skipped).
  function playStory(list, then, chapterCard, key) {
    if (!list || !list.length) {
      then();
      return;
    }
    mode = "story";
    beats = list;
    beatIndex = 0;
    lineIndex = 0;
    storyKey = key || null;
    storyStarted = performance.now();
    afterStory = () => {
      if (storyKey) {
        save.seen[storyKey] = true;
        persist();
      }
      then();
    };
    show("story-screen");
    const card = $("chapter-card");
    card.hidden = !chapterCard;
    if (chapterCard) {
      card.textContent = "";
      const small = document.createElement("small");
      small.textContent = chapterCard.kicker;
      card.append(small, chapterCard.title);
    }
    renderBeat(true);
  }
  function renderBeat(newBeat) {
    const beat = beats[beatIndex];
    if (sceneName !== beat.scene) sceneTime = 0;
    sceneName = beat.scene;
    const owlImg = $("owl");
    owlImg.src = `assets/owl_${beat.eyes}.png`;
    const line = beat.lines[lineIndex];
    const speaker = $("speaker");
    speaker.textContent = SPEAKERS[line.who] || "";
    speaker.className = "speaker " + line.who;
    owlImg.classList.toggle("talking", line.who === "owl");
    $("line").className = "line" + (line.who ? "" : " narration");
    lineText = line.text;
    typed = 0;
    lineShown = performance.now();
    $("line").textContent = "";
    if (newBeat && beat.fx === "lightning") {
      sceneFlash = 1;
      sound("lightning");
    } else sound("page", { volume: 0.5 });
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
    tip = null;

  function openStage(id) {
    const key = "pre_" + id;
    const chapter = Levels.chapterOf(id);
    const firstOfChapter = Levels.all.find((s) => Levels.chapterOf(s.id) === chapter).id === id;
    if (!save.seen[key])
      playStory(
        Story.before[id],
        () => startStage(id),
        firstOfChapter ? { kicker: `CHAPTER ${ROMAN[chapter]}`, title: Story.chapters[chapter] } : null,
        key,
      );
    else startStage(id);
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
    show("stage-screen");
    $("stage-number").textContent = `STAGE ${id} · CHAPTER ${ROMAN[Levels.chapterOf(id)]}`;
    $("stage-name").textContent = level.name;
    $("lesson").textContent = level.lesson;
    $("lesson").classList.remove("gone");
    updateStars();
    queueTips(level);
    if (tipQueue.length) showTip();
  }

  // Keeps Izan in the lower third with a strip of ground under the start.
  function cameraTarget(heroY, level) {
    const visible = H / (W / 12);
    const floor = -1.6;
    const ceiling = Math.max(floor, level.height - visible + 2.5);
    return Math.max(floor, Math.min(heroY - visible * 0.36, ceiling));
  }

  function updateStars() {
    const lit = game ? game.smashed() : 0;
    [...$("hud-stars").children].forEach((star, i) => star.classList.toggle("on", i < lit));
    $("hud-stars").setAttribute("aria-label", `${lit} of 3 pumpkins smashed`);
  }

  /* ---------- Teaching cards ---------- */
  // Each kind is explained once, the first time it is on screen, with a spotlight.
  function queueTips(level) {
    tipQueue = [];
    const add = (kind, x, y, r) => {
      if (save.tips[kind] || tipQueue.some((t) => t.kind === kind) || !Story.tips[kind]) return;
      tipQueue.push({ kind, x, y, r });
    };
    if (level.id === 1) add("launch", level.start.x, level.start.y, 1.4);
    const hunter = level.pumpkins.find((p) => p.range > 0 && !p.roll);
    if (hunter) add("hunter", hunter.x, hunter.y, 1.3);
    if (level.id >= 3) add("dash", level.start.x, level.start.y, 1.4);
    for (const p of level.platforms)
      if (["seesaw", "mover", "drop", "post", "ghost"].includes(p.type))
        add(p.type, p.x, p.y + (p.type === "post" ? -0.6 : 0), p.w / 2 + 0.8);
    for (const o of level.objects) if (Story.tips[o.type]) add(o.type, o.x, o.y, o.type === "zip" ? 2.4 : 1.4);
    const roll = level.pumpkins.find((p) => p.roll);
    if (roll) add("roll", roll.x, roll.y, 1.3);
    if (level.boss) add("boss", level.boss.x, level.boss.y, 2.2);
  }
  function showTip() {
    tip = tipQueue.shift();
    if (!tip) {
      $("tip").hidden = true;
      return;
    }
    const data = Story.tips[tip.kind];
    tip.alpha = 0;
    $("tip").hidden = false;
    $("tip-lines").textContent = "";
    for (const text of data.lines) {
      const p = document.createElement("p");
      p.textContent = text;
      $("tip-lines").append(p);
    }
    $("tip-hand").className = "tip-hand " + data.gesture;
    $("tip-hand").hidden = data.gesture === "none";
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

  /* ---------- Owl remarks and toasts ---------- */
  let toastTimer = 0;
  function toast(text, owlSays) {
    $("toast").textContent = text;
    $("toast").classList.toggle("owl-says", Boolean(owlSays));
    $("toast").classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $("toast").classList.remove("show"), owlSays ? 2200 : 1300);
  }
  function remark(key) {
    if (remarked[key]) return;
    remarked[key] = true;
    const lines = Story.remarks[key];
    if (lines) toast(lines[Math.floor(Math.random() * lines.length)], true);
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
          remarked.death = false;
          remark("deathThird");
        } else remark("death");
      } else if (e.type === "launch") sound("launch");
      else if (e.type === "dash") sound("dash");
      else if (e.type === "web") {
        fx.silk(at.x, at.y);
        sound("web");
      } else if (e.type === "tear") {
        fx.silk(at.x, at.y);
        sound("snap", { volume: 0.5 });
      } else if (e.type === "pop" || e.type === "splat") fx.silk(at.x, at.y);
      else if (e.type === "boing") {
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
      } else if (e.type === "snap") sound("snap");
      else if (e.type === "thud") {
        shake = Math.max(shake, 0.3);
        fx.dust(at.x, at.y);
        sound("crush", { volume: 0.7, pitch: 0.8 });
      } else if (e.type === "seesaw") {
        shake = Math.max(shake, 0.2);
        fx.dust(at.x, at.y);
        sound("seesaw");
      } else if (e.type === "roll") {
        sound("roll");
        remark("roll");
      } else if (e.type === "notice") sound("notice", { volume: 0.5 });
      else if (e.type === "spider") {
        fx.sparks(at.x, at.y, "rgba(210,220,255,", 12);
        sound("snap", { pitch: 0.6 });
      } else if (e.type === "boss-hit") {
        fx.sparks(game.boss.x, game.boss.y, "rgba(255,255,255,", 18);
        shake = 0.3;
        hitStop = 0.08;
        sound("bosshit");
        remarked.bossHit = false;
        remark("bossHit");
      } else if (e.type === "boss-down") {
        fx.sparks(at.x, at.y, "rgba(255,90,90,", 30);
        shake = 0.6;
        sound("bossdown");
        toast("The Weaver falls. The door is open.");
      } else if (e.type === "cannon") {
        fx.sparks(at.x, at.y, "rgba(160,255,80,", 10);
        sound("web", { pitch: 0.5, volume: 0.6 });
      } else if (e.type === "fire") {
        fx.sparks(at.x, at.y, "rgba(160,255,80,", 10);
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
    const last = stageId === Levels.count;
    $("result-title").textContent = last ? "The Weaver is gone" : "The door opens";
    $("result-line").textContent =
      smashed === 3
        ? "Three pumpkins will never reach the windows."
        : smashed === 0
          ? "You escaped, but every pumpkin here is still hungry."
          : `${smashed} of 3 pumpkins smashed. The rest are still climbing.`;
    $("result-next").setAttribute("aria-label", last ? "Ending" : "Next stage");
  }

  function nextStage() {
    const id = stageId;
    const last = id === Levels.count;
    const goOn = () => (last ? toTitle() : openStage(id + 1));
    if (Story.after[id] && !save.seen["post_" + id])
      playStory(Story.after[id], goOn, last ? { kicker: "THE END", title: "Midnight" } : null, "post_" + id);
    else goOn();
  }

  /* ---------- Input ---------- */
  const unitsPerPixel = () => 12 / W;
  canvas.addEventListener("pointerdown", (event) => {
    if (mode !== "stage" || paused || tip || !game || game.won || drag) return;
    canvas.setPointerCapture(event.pointerId);
    if (game.hero.state === "flying" || game.hero.state === "zip") {
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
    // Pumpkins freeze only while a real aim is held, not under a resting finger.
    game.setAim(Boolean(aim));
  });
  function release(event, cancel) {
    if (!drag || drag.id !== event.pointerId) return;
    game.setAim(false);
    if (!cancel && aim && game.hero.state === "resting" && game.launch(aim.x, aim.y)) {
      if (!launchedOnce) $("lesson").classList.add("gone");
      launchedOnce = true;
    }
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
        if (game.hero.state === "flying" || game.hero.state === "zip") game.dash();
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
    if (!save.seen.prologue)
      playStory(Story.prologue, () => openStage(1), { kicker: "HOLLOW NIGHT", title: "Prologue" }, "prologue");
    else toMap();
  });
  click("open-map", toMap);
  click("replay-prologue", () => playStory(Story.prologue, toMap, { kicker: "HOLLOW NIGHT", title: "Prologue" }));
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
  let last = 0;
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    if (mode === "stage" || mode === "result") stageFrame(dt);
    else {
      sceneTime += dt;
      sceneFlash = Math.max(0, sceneFlash - dt * 2.2);
      if (mode === "story") typeLine(dt);
      ctx.clearRect(0, 0, W, H);
      const line = mode === "story" ? beats[beatIndex].lines[lineIndex] : null;
      Art.scene(ctx, sceneName, W, H, sceneTime, {
        speaker: line ? line.who : "",
        lineAge: line ? (performance.now() - lineShown) / 1000 : 9,
        flash: sceneFlash > 0.6 ? 1 : sceneFlash > 0.45 ? 0 : sceneFlash * 0.8,
      });
    }
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
      chapter: Levels.chapterOf(stageId),
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
