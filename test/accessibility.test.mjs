import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { createApp } from "./app-harness.mjs";

test("documents pointer and keyboard state controls in a visible key", () => {
  const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /<section class="key" aria-label="Sprite state key">/);
  assert.match(html, /Click to cycle states; Shift-click goes backward/);
  assert.match(html, /<kbd>1<\/kbd> Not Found/);
  assert.match(html, /aria-describedby="spriteInstructions"/);
  assert.doesNotMatch(html, /\.key\s*\{\s*display:\s*none/);
});

test("exposes all three sprite states with tri-state checkbox semantics", async () => {
  const app = createApp();
  const card = app.card("water-sprite");

  assert.equal(card.getAttribute("role"), "checkbox");
  assert.equal(card.getAttribute("aria-keyshortcuts"), "1 2 3");
  assert.equal(card.getAttribute("aria-checked"), "false");
  assert.equal(card.getAttribute("aria-label"), "Water Sprite: Not Found");

  await card.dispatch("click");
  assert.equal(card.getAttribute("aria-checked"), "mixed");
  assert.equal(card.getAttribute("aria-label"), "Water Sprite: Found");

  await card.dispatch("click");
  assert.equal(card.getAttribute("aria-checked"), "true");
  assert.equal(card.getAttribute("aria-label"), "Water Sprite: Mastered");

  await card.dispatch("click");
  assert.equal(card.getAttribute("aria-checked"), "false");
  assert.equal(card.getAttribute("aria-label"), "Water Sprite: Not Found");
});

test("number shortcuts update the accessible state directly", async () => {
  const app = createApp();
  const card = app.card("water-sprite");

  await card.dispatch("keydown", { key: "3" });

  assert.equal(card.dataset.state, "mastered");
  assert.equal(card.getAttribute("aria-checked"), "true");
  assert.equal(card.getAttribute("aria-label"), "Water Sprite: Mastered");
});
