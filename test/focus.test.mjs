import assert from "node:assert/strict";
import test from "node:test";

import { createApp } from "./app-harness.mjs";

test("moves focus to the next visible card when a state filter hides the active card", async () => {
  const app = createApp();
  app.document.getElementById("seasonFilter").value = "c7s3";
  app.document.getElementById("statusFilter").value = "not-found";
  app.evaluate("applyFilters()");
  const card = app.card("water-sprite");
  card.focus();

  await card.dispatch("click");

  assert.equal(card.hidden, true);
  assert.equal(app.document.activeElement.id, "gold-water-sprite");
});

test("preserves keyboard flow after a numbered state shortcut hides a card", async () => {
  const app = createApp();
  app.document.getElementById("seasonFilter").value = "c7s3";
  app.document.getElementById("statusFilter").value = "not-found";
  app.evaluate("applyFilters()");
  const card = app.card("water-sprite");
  card.focus();

  await card.dispatch("keydown", { key: "2" });

  assert.equal(card.dataset.state, "found");
  assert.equal(card.hidden, true);
  assert.equal(app.document.activeElement.id, "gold-water-sprite");
});

test("moves focus to Clear filters when the final result disappears", async () => {
  const app = createApp();
  app.document.getElementById("seasonFilter").value = "c7s3";
  app.evaluate(`checks.forEach(card => updateSpriteState(card, "found"));
    updateSpriteState(document.getElementById("water-sprite"), "not-found")`);
  app.document.getElementById("statusFilter").value = "not-found";
  app.evaluate("applyFilters()");
  const card = app.card("water-sprite");
  card.focus();

  await card.dispatch("click");

  assert.equal(app.document.getElementById("emptyResults").hidden, false);
  assert.equal(app.document.activeElement.id, "clearFilters");
});

test("keeps focus on a changed card when it remains visible", async () => {
  const app = createApp();
  app.document.getElementById("seasonFilter").value = "c7s3";
  app.evaluate("applyFilters()");
  const card = app.card("water-sprite");
  card.focus();

  await card.dispatch("click");

  assert.equal(card.hidden, false);
  assert.equal(app.document.activeElement, card);
});
