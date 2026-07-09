import assert from "node:assert/strict";
import test from "node:test";

import { createApp } from "./app-harness.mjs";

test("does not treat status labels as sprite-name search terms", () => {
  const app = createApp();
  app.evaluate('updateSpriteState(document.getElementById("water-sprite"), "found")');
  app.document.getElementById("spriteSearch").value = "found";

  app.evaluate("applyFilters()");

  assert.equal(app.document.querySelectorAll(".sprite-card").every(card => card.hidden), true);
  assert.equal(app.document.getElementById("emptyResults").hidden, false);
});

test("searches sprite names and families regardless of state", () => {
  const app = createApp();
  app.evaluate('updateSpriteState(document.getElementById("water-sprite"), "found")');
  app.document.getElementById("spriteSearch").value = "water";

  app.evaluate("applyFilters()");

  const visibleCards = app.document.querySelectorAll(".sprite-card").filter(card => !card.hidden);
  assert.equal(visibleCards.length, 5);
  assert.equal(visibleCards.every(card => card.dataset.name.includes("Water")), true);
});

test("combines name search with the dedicated status filter", () => {
  const app = createApp();
  app.evaluate(`updateSpriteState(document.getElementById("water-sprite"), "found");
    updateSpriteState(document.getElementById("gold-water-sprite"), "mastered")`);
  app.document.getElementById("spriteSearch").value = "water";
  app.document.getElementById("statusFilter").value = "found";

  app.evaluate("applyFilters()");

  const visibleCards = app.document.querySelectorAll(".sprite-card").filter(card => !card.hidden);
  assert.deepEqual(visibleCards.map(card => card.id), ["water-sprite"]);
});
