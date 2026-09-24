import assert from "node:assert/strict";
import test from "node:test";

import { createApp } from "./app-harness.mjs";

test("does not treat status labels as sprite-name search terms", () => {
  const app = createApp();
  app.document.getElementById("seasonFilter").value = "c7s3";
  app.evaluate('updateSpriteState(document.getElementById("water-sprite"), "found")');
  app.document.getElementById("spriteSearch").value = "found";

  app.evaluate("applyFilters()");

  assert.equal(app.document.querySelectorAll(".sprite-card").every(card => card.hidden), true);
  assert.equal(app.document.getElementById("emptyResults").hidden, false);
});

test("searches sprite names and families regardless of state", () => {
  const app = createApp();
  app.document.getElementById("seasonFilter").value = "c7s3";
  app.evaluate('updateSpriteState(document.getElementById("water-sprite"), "found")');
  app.document.getElementById("spriteSearch").value = "water";

  app.evaluate("applyFilters()");

  const visibleCards = app.document.querySelectorAll(".sprite-card").filter(card => !card.hidden);
  assert.equal(visibleCards.length, 7);
  assert.equal(visibleCards.every(card => card.dataset.name.includes("Water")), true);
});

test("combines name search with the dedicated status filter", () => {
  const app = createApp();
  app.document.getElementById("seasonFilter").value = "c7s3";
  app.evaluate(`updateSpriteState(document.getElementById("water-sprite"), "found");
    updateSpriteState(document.getElementById("gold-water-sprite"), "mastered")`);
  app.document.getElementById("spriteSearch").value = "water";
  app.document.getElementById("statusFilter").value = "found";

  app.evaluate("applyFilters()");

  const visibleCards = app.document.querySelectorAll(".sprite-card").filter(card => !card.hidden);
  assert.deepEqual(visibleCards.map(card => card.id), ["water-sprite"]);
});

test("finds Body Slam by its released name and its Crash Bandicoot family", () => {
  const app = createApp();
  const search = app.document.getElementById("spriteSearch");
  search.value = "body slam";
  app.evaluate("applyFilters()");

  let visibleCards = app.document.querySelectorAll(".sprite-card").filter(card => !card.hidden);
  assert.deepEqual(visibleCards.map(card => card.id), ["bounty-hunter-body-slam-sprite"]);
  assert.equal(visibleCards[0].dataset.name, "Bounty Hunter Body Slam Sprite");

  search.value = "crash bandicoot";
  app.evaluate("applyFilters()");

  visibleCards = app.document.querySelectorAll(".sprite-card").filter(card => !card.hidden);
  assert.deepEqual(visibleCards.map(card => card.id), [
    "crash-bandicoot-sprite", "gold-crash-bandicoot-sprite", "cheat-master-crash-bandicoot-sprite",
    "loot-hacker-crash-bandicoot-sprite", "bounty-hunter-body-slam-sprite"
  ]);
});
