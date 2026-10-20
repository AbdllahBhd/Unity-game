(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const keys = ["light", "shadow", "bell"];
  const names = ["PAINTED INK", "CARVED SHADOW", "PAPER THEATRE"];
  const captions = [
    "Lantern brass, rooted stone, remembered flame.",
    "Etched bark, empty moonlight, a living silhouette.",
    "Worn masks, suspended bells, a painted promise.",
  ];
  const abilityNames = {
    light: "Lantern lure",
    shadow: "Replay shadow",
    bell: "Ring the bell",
  };
  const mechanicDescriptions = {
    light:
      "Place a light decoy above Izan. Nearby hunters gather around it for five seconds. Plan a leap through the gathering.",
    shadow:
      "Land safely to record your flight. Replay it as a shadow to touch the marked ghost switch and open its barrier.",
    bell: "Ring the bell from a resting perch to switch phases. Marked platforms and hunters change state. The visible countdown shows the automatic cycle.",
  };
  const canvas = $("game-canvas");
  const ctx = canvas.getContext("2d");
  let game,
    stage = 1,
    cameraY = -1.3,
    paused = false,
    drag = null,
    replay = null,
    lastTime = 0,
    accumulator = 0,
    view;
  let stored = {};
  try {
    stored = JSON.parse(localStorage.getItem("hn-study-choice") || "{}");
  } catch (error) {
    console.warn("Saved choices could not be read:", error.message);
  }
  for (const name of ["mode", "direction", "theme", "pursuit"]) {
    if (
      Array.from($(name).options).some(
        (option) => option.value === stored[name],
      )
    )
      $(name).value = stored[name];
  }
  function saveChoices() {
    const choice = Object.fromEntries(
      ["mode", "direction", "theme", "pursuit"].map((name) => [
        name,
        $(name).value,
      ]),
    );
    try {
      localStorage.setItem("hn-study-choice", JSON.stringify(choice));
    } catch (error) {
      console.warn("Choices will last only for this visit:", error.message);
    }
  }
  function text(tag, content, className) {
    const node = document.createElement(tag);
    node.textContent = content;
    if (className) node.className = className;
    return node;
  }
  function drawComparison() {
    keys.forEach((key, i) => {
      const story = HNStories[key],
        card = document.createElement("article");
      card.className = "direction-card";
      const top = document.createElement("div");
      top.className = "direction-top";
      top.append(
        text("span", "0" + (i + 1), "direction-number"),
        text("span", names[i]),
      );
      const preview = document.createElement("canvas");
      preview.width = 390;
      preview.height = 410;
      preview.setAttribute("role", "img");
      preview.setAttribute(
        "aria-label",
        story.title + " art concept: " + captions[i],
      );
      const concept = new HNGame.Game(HNLevels.get("redesigned", 1, key), {
        direction: key,
      });
      HNArt.draw(
        preview.getContext("2d"),
        concept.snapshot(),
        { width: 390, height: 410, scale: 32.5, cameraY: -1.3 },
        key,
      );
      const copy = document.createElement("div");
      copy.className = "direction-copy";
      copy.append(
        text("span", story.subtitle || names[i], "tag"),
        text("h2", story.title),
        text("p", story.premise),
      );
      copy.append(
        text("p", "PLAY EXPERIMENT / " + abilityNames[key], "mechanic-caption"),
      );
      const button = text("button", "Play this direction →");
      button.addEventListener("click", () => {
        $("direction").value = key;
        $("theme").value = key;
        $("mode").value = "redesigned";
        saveChoices();
        loadStage(1);
        $("play").scrollIntoView();
      });
      copy.append(button);
      card.append(top, preview, copy);
      $("direction-cards").append(card);
      const asset = document.createElement("div");
      asset.className = "asset-item";
      const sheet = document.createElement("canvas");
      sheet.width = 720;
      sheet.height = 300;
      sheet.setAttribute("role", "img");
      sheet.setAttribute(
        "aria-label",
        names[i] +
          ": rabbit, hunter, platform, doorway, ability and boss concept drawings",
      );
      HNArt.drawSheet(sheet.getContext("2d"), key);
      asset.append(
        text("h3", "0" + (i + 1) + " / " + names[i]),
        sheet,
        text("p", captions[i]),
      );
      $("asset-sheets").append(asset);
    });
  }
  function renderStory(key) {
    const story = HNStories[key];
    for (const button of $("story-tabs").children)
      button.setAttribute("aria-pressed", String(button.dataset.key === key));
    const content = $("story-content");
    content.replaceChildren();
    const opening = document.createElement("div");
    opening.append(
      text("p", "THE OPENING", "eyebrow"),
      text("h3", story.title),
      text("p", story.opening, "opening"),
      text("h4", "The design tension"),
      text("p", story.tradeoff),
    );
    const chapters = document.createElement("div");
    story.chapters.forEach((chapter, i) => {
      chapters.append(
        text("p", "CHAPTER 0" + (i + 1), "eyebrow"),
        text("h4", chapter.title),
        text("p", chapter.text),
      );
    });
    const ending = document.createElement("div");
    ending.className = "ending";
    ending.append(text("h4", "The ending"), text("p", story.ending));
    chapters.append(ending);
    content.append(opening, chapters);
  }
  function cancelDrag() {
    if (!drag) return;
    const pointerId = drag.id;
    drag = null;
    if (game) game.setAim(false);
    if (canvas.hasPointerCapture(pointerId))
      canvas.releasePointerCapture(pointerId);
  }
  function loadStage(id) {
    cancelDrag();
    replay = null;
    paused = false;
    stage = id;
    cameraY = -1.3;
    accumulator = 0;
    $("pause").textContent = "Pause";
    $("pause").setAttribute("aria-pressed", "false");
    $("watch-route").textContent = "Watch a solution";
    game = new HNGame.Game(
      HNLevels.get($("mode").value, stage, $("direction").value),
      { direction: $("direction").value, pursuit: $("pursuit").value },
    );
    const level = game.level,
      story = HNStories[$("direction").value];
    cameraY = Math.max(-1.3, game.hero.y - 5);
    for (const button of $("stage-buttons").children)
      button.setAttribute(
        "aria-pressed",
        String(Number(button.dataset.stage) === stage),
      );
    $("stage-chapter").textContent =
      ($("mode").value === "baseline" ? "CURRENT UNITY LAYOUT" : "REDESIGN") +
      " / STAGE " +
      String(stage).padStart(2, "0");
    $("stage-name").textContent = level.name;
    $("stage-lesson").textContent = level.lesson || "";
    $("stage-hint").textContent = level.hint || "";
    $("stage-story").textContent = story.stages[stage - 1];
    $("game-location").textContent = story.title.toUpperCase();
    $("par-label").textContent = "PAR " + level.par;
    $("mechanic-title").textContent = level.mechanic
      ? abilityNames[$("direction").value]
      : "Master the leap";
    $("mechanic-copy").textContent = level.mechanic
      ? mechanicDescriptions[$("direction").value]
      : "This stage teaches the shared physics. The signature mechanic is explored in redesigned stages 3, 6 and 10.";
    $("ability").replaceChildren(
      text("span", abilityNames[$("direction").value]),
      text("kbd", "L"),
    );
    $("result").hidden = true;
    $("next").textContent =
      stage === 10 ? "Return to the directions →" : "Next stage →";
    $("route-note").textContent = "Replays real launches in planning mode.";
    $("watch-route").disabled = !level.route || !level.route.length;
    updateStatus();
  }
  function updateStatus() {
    const state = game.snapshot();
    $("launches").textContent = state.launches;
    $("remaining").textContent = state.remaining;
    $("deaths").textContent = state.deaths;
    $("dash-state").textContent =
      state.dashTime > 0
        ? "Active"
        : state.dashReady
          ? "Ready"
          : state.hero.state === "resting"
            ? "On launch"
            : "Spent";
    $("dash").disabled =
      paused || !state.dashReady || state.hero.state !== "flying";
    $("ability").disabled = paused || !state.canActivate || state.won;
    $("launch-control").disabled =
      paused || state.won || !["resting", "cannon"].includes(state.hero.state);
    let message = "Pull back to aim your first leap.";
    if (state.won) message = "All clear. The night lets you pass.";
    else if (paused) message = "Paused. Resume when you are ready.";
    else if (replay)
      message = "Watching a solution · real launch and collision simulation.";
    else if (drag) message = "Release to launch · Escape cancels the aim.";
    else if (state.hero.state === "flying")
      message = state.dashReady
        ? "Tap the playfield or press Space to dash."
        : "Dash spent. Find a safe place to land.";
    else if (state.hero.state === "cannon")
      message = "The cauldron is preparing its next shot.";
    else if (state.launches > 0)
      message = "Resting safely. Plan your next leap.";
    if (state.boss && state.boss.hp > 0)
      message += " Queen: " + state.boss.hp + " hits remain.";
    if (state.level.mechanic && $("direction").value === "bell")
      message +=
        " Bell phase " +
        (state.phase + 1) +
        " · " +
        Math.max(
          0,
          (state.level.bellPeriod || 12) / 2 - state.phaseClock,
        ).toFixed(1) +
        "s.";
    if ($("game-status").textContent !== message)
      $("game-status").textContent = message;
    if (state.won && $("result").hidden) {
      $("result").hidden = false;
      $("result-stars").textContent =
        "✦".repeat(state.stars) + "◇".repeat(3 - state.stars);
      $("result-summary").textContent =
        state.launches +
        " leaps · " +
        state.deaths +
        " deaths · par " +
        state.level.par;
      $("watch-route").textContent = "Watch again";
      replay = null;
    }
  }
  function point(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) * view.width) / rect.width,
      y: ((event.clientY - rect.top) * view.height) / rect.height,
    };
  }
  function velocity() {
    return HNGame.launchVelocity(
      (drag.start.x - drag.end.x) / view.scale,
      (drag.end.y - drag.start.y) / view.scale,
    );
  }
  function stopReplay() {
    replay = null;
    $("watch-route").textContent = "Watch a solution";
  }
  canvas.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || paused || game.won || drag) return;
    canvas.focus({ preventScroll: true });
    stopReplay();
    if (game.hero.state === "flying") {
      game.dash();
      return;
    }
    if (!["resting", "cannon"].includes(game.hero.state)) return;
    const p = point(event);
    drag = { id: event.pointerId, start: p, end: p };
    game.setAim(true);
    canvas.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  canvas.addEventListener("pointermove", (event) => {
    if (drag && drag.id === event.pointerId) {
      drag.end = point(event);
      event.preventDefault();
    }
  });
  canvas.addEventListener("pointerup", (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    drag.end = point(event);
    const v = velocity(),
      distance =
        Math.hypot(drag.start.x - drag.end.x, drag.start.y - drag.end.y) /
        view.scale;
    cancelDrag();
    if (distance >= 0.45) game.launch(v.x, v.y);
    updateStatus();
  });
  canvas.addEventListener("pointercancel", cancelDrag);
  canvas.addEventListener("lostpointercapture", cancelDrag);
  window.addEventListener("blur", () => {
    cancelDrag();
    if (game && !game.won) setPaused(true);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelDrag();
      setPaused(true);
    }
  });
  function setPaused(value) {
    cancelDrag();
    paused = value;
    accumulator = 0;
    $("pause").textContent = paused ? "Resume" : "Pause";
    $("pause").setAttribute("aria-pressed", String(paused));
    updateStatus();
  }
  canvas.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (drag) cancelDrag();
      else setPaused(!paused);
      event.preventDefault();
    } else if (event.key.toLowerCase() === "r") {
      loadStage(stage);
      event.preventDefault();
    } else if (
      !paused &&
      (event.code === "Space" || event.key.toLowerCase() === "l")
    ) {
      stopReplay();
      if (event.code === "Space") game.dash();
      else game.activate();
      event.preventDefault();
    }
  });
  $("dash").addEventListener("click", () => {
    stopReplay();
    game.dash();
    updateStatus();
  });
  $("ability").addEventListener("click", () => {
    stopReplay();
    game.activate();
    updateStatus();
  });
  $("restart").addEventListener("click", () => loadStage(stage));
  $("pause").addEventListener("click", () => setPaused(!paused));
  $("next").addEventListener("click", () => {
    if (stage === 10) $("compare").scrollIntoView();
    else loadStage(stage + 1);
  });
  for (const name of ["mode", "direction", "pursuit"])
    $(name).addEventListener("change", () => {
      saveChoices();
      loadStage(stage);
    });
  $("theme").addEventListener("change", saveChoices);
  for (const name of ["angle", "power"])
    $(name).addEventListener("input", () => {
      $(name + "-value").textContent =
        $(name).value + (name === "angle" ? "°" : "");
    });
  $("launch-control").addEventListener("click", () => {
    stopReplay();
    const angle = (Number($("angle").value) * Math.PI) / 180,
      power = Number($("power").value);
    game.launch(Math.cos(angle) * power, Math.sin(angle) * power);
    updateStatus();
    canvas.focus({ preventScroll: true });
  });
  $("read-current-story").addEventListener("click", () => {
    renderStory($("direction").value);
    $("story").scrollIntoView();
  });
  $("watch-route").addEventListener("click", () => {
    if (replay) {
      stopReplay();
      updateStatus();
      return;
    }
    $("pursuit").value = "planning";
    saveChoices();
    loadStage(stage);
    replay = { index: 0, elapsed: 0, started: false };
    $("watch-route").textContent = "Stop solution";
  });
  function advanceReplay(dt) {
    if (!replay) return;
    const action = game.level.route[replay.index];
    if (!action) {
      stopReplay();
      $("route-note").textContent = game.won
        ? "Solution complete."
        : "Replay ended. You can continue this route manually.";
      return;
    }
    if (!replay.started) {
      if (action.activate) game.activate();
      if (action.vx !== undefined) game.launch(action.vx, action.vy);
      replay.started = true;
    }
    if (
      action.dashAt !== undefined &&
      replay.elapsed >= action.dashAt &&
      game.dashReady
    )
      game.dash();
    replay.elapsed += dt;
    if (
      replay.elapsed + 1e-9 >=
      (action.wait === undefined ? 4 : action.wait)
    ) {
      replay.index++;
      replay.elapsed = 0;
      replay.started = false;
    }
  }
  function drawAim() {
    if (!drag) return;
    const v = velocity(),
      hero = game.hero;
    ctx.save();
    ctx.fillStyle = "#f1e2ad";
    for (let t = 0.08; t < 1.65; t += 0.08) {
      const p = HNGame.trajectory(hero, v, t),
        x = view.width / 2 + p.x * view.scale,
        y = view.height - (p.y - cameraY) * view.scale;
      ctx.globalAlpha = 1 - t / 1.8;
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = "#f1e2ad";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.moveTo(drag.start.x, drag.start.y);
    ctx.lineTo(drag.end.x, drag.end.y);
    ctx.stroke();
    ctx.restore();
  }
  function resize() {
    const width = canvas.getBoundingClientRect().width || 432,
      height = (width * 5) / 3,
      ratio = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    view = {
      width,
      height,
      scale: width / 12,
      cameraY,
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches,
    };
  }
  function frame(now) {
    const elapsed = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 0;
    lastTime = now;
    if (!paused) {
      accumulator += elapsed;
      while (accumulator >= 1 / 120) {
        advanceReplay(1 / 120);
        game.step(1 / 120);
        accumulator -= 1 / 120;
      }
    }
    const target = Math.max(-1.3, game.hero.y - 5.5);
    cameraY += (target - cameraY) * Math.min(1, elapsed * 7);
    view.cameraY = cameraY;
    HNArt.draw(ctx, game.snapshot(), view, $("theme").value);
    drawAim();
    if (paused) {
      ctx.save();
      ctx.fillStyle = "#0008";
      ctx.fillRect(0, 0, view.width, view.height);
      ctx.fillStyle = "#eee9db";
      ctx.font = "24px Georgia";
      ctx.textAlign = "center";
      ctx.fillText("The night waits.", view.width / 2, view.height / 2);
      ctx.restore();
    }
    updateStatus();
    requestAnimationFrame(frame);
  }
  drawComparison();
  keys.forEach((key) => {
    const button = text("button", HNStories[key].title);
    button.dataset.key = key;
    button.addEventListener("click", () => renderStory(key));
    $("story-tabs").append(button);
  });
  for (let id = 1; id <= 10; id++) {
    const button = text("button", String(id).padStart(2, "0"));
    button.dataset.stage = id;
    button.setAttribute("aria-label", "Stage " + id);
    button.addEventListener("click", () => loadStage(id));
    $("stage-buttons").append(button);
  }
  renderStory($("direction").value);
  loadStage(1);
  resize();
  window.addEventListener("resize", () => {
    cancelDrag();
    resize();
  });
  requestAnimationFrame(frame);
})();
