/* exported browserCheck */
async function browserCheck(page) {
  const evidence = [];
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  await page.goto("http://127.0.0.1:8876/prototype/");
  await page.setViewportSize({ width: 1280, height: 1000 });
  const check = (condition, message) => {
    if (!condition) throw new Error(message);
  };
  await page.getByLabel("Art treatment", { exact: true }).selectOption("bell");
  await page
    .getByLabel("Story & signature mechanic", { exact: true })
    .selectOption("shadow");
  check(
    (await page.locator("#theme").inputValue()) === "bell",
    "Story selection changed independent art selection",
  );
  await page.getByRole("button", { name: "Stage 6", exact: true }).click();
  await page
    .getByRole("button", { name: "Watch a solution", exact: true })
    .click();
  await page.waitForFunction(
    () => !document.getElementById("result").hidden,
    null,
    { timeout: 20000 },
  );
  check(
    (await page.locator("#result-summary").textContent()).includes("0 deaths"),
    "Shadow replay did not complete without death",
  );
  evidence.push("Shadow stage 6: real replay opens required switch and wins.");
  await page.getByRole("button", { name: "Restart R", exact: true }).click();
  check(
    (await page.locator("#launches").textContent()) === "0",
    "Restart retained launch count",
  );
  await page
    .getByLabel("Story & signature mechanic", { exact: true })
    .selectOption("bell");
  await page.getByRole("button", { name: "Stage 10", exact: true }).click();
  await page
    .getByRole("button", { name: "Watch a solution", exact: true })
    .click();
  await page.waitForFunction(
    () => !document.getElementById("result").hidden,
    null,
    { timeout: 25000 },
  );
  check(
    (await page.locator("#result-summary").textContent()).includes("0 deaths"),
    "Bell boss replay did not complete",
  );
  evidence.push("Bell stage 10: normal boss and hunter victory.");
  await page
    .getByLabel("Stage collection", { exact: true })
    .selectOption("baseline");
  await page.getByRole("button", { name: "Stage 9", exact: true }).click();
  await page
    .getByRole("button", { name: "Watch a solution", exact: true })
    .click();
  await page.waitForFunction(
    () => !document.getElementById("result").hidden,
    null,
    { timeout: 25000 },
  );
  check(
    (await page.locator("#result-summary").textContent()).includes("6 leaps"),
    "Original cannon replay differs from recorded evidence",
  );
  check(
    (await page.locator("#result-stars").textContent()) === "✦✦◇",
    "Over-par route received an undeserved third star",
  );
  evidence.push(
    "Original stage 9: cannon route wins with two stars, six leaps.",
  );
  await page
    .getByLabel("Stage collection", { exact: true })
    .selectOption("redesigned");
  await page.getByRole("button", { name: "Stage 1", exact: true }).click();
  await page.locator("#game-canvas").scrollIntoViewIfNeeded();
  const bounds = await page.locator("#game-canvas").boundingBox();
  await page.mouse.move(
    bounds.x + bounds.width / 2,
    bounds.y + bounds.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    bounds.x + bounds.width / 2 - 60,
    bounds.y + bounds.height / 2 + 80,
  );
  await page
    .locator("#game-canvas")
    .dispatchEvent("pointercancel", { pointerId: 1, pointerType: "mouse" });
  await page.mouse.up();
  check(
    (await page.locator("#launches").textContent()) === "0",
    "Cancelled drag launched the rabbit",
  );
  evidence.push("Pointer cancellation leaves launch count at zero.");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  check(
    (await page.locator("#pause").getAttribute("aria-pressed")) === "true",
    "Pause status is incorrect",
  );
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await page
    .getByText("Launch controls & keyboard help", { exact: true })
    .click();
  await page
    .getByRole("button", { name: "Launch with these settings", exact: true })
    .click();
  check(
    Number(await page.locator("#launches").textContent()) >= 1,
    "Accessible launch control failed",
  );
  await page.getByRole("button", { name: "Restart R", exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("#game-canvas").scrollIntoViewIfNeeded();
  check(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
    "Mobile page overflows horizontally",
  );
  const mobile = await page.locator("#game-canvas").boundingBox();
  const touch = await page.context().newCDPSession(page);
  await touch.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: mobile.x + 150, y: mobile.y + 250 }],
  });
  await touch.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: mobile.x + 90, y: mobile.y + 340 }],
  });
  await touch.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await touch.detach();
  check(
    Number(await page.locator("#launches").textContent()) >= 1,
    "Touch pointer launch failed",
  );
  await page.screenshot({ path: "output/playwright/play-mobile.png" });
  evidence.push(
    "390px mobile: no horizontal overflow; touch pointer launch accepted.",
  );
  await page.getByRole("button", { name: "Restart R", exact: true }).click();
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page
    .locator("#direction-cards")
    .screenshot({ path: "output/playwright/directions.png" });
  await page.locator("#play").scrollIntoViewIfNeeded();
  await page.screenshot({ path: "output/playwright/play-desktop.png" });
  check(
    runtimeErrors.length === 0,
    "Browser runtime errors: " + runtimeErrors.join("; "),
  );
  return evidence;
}
