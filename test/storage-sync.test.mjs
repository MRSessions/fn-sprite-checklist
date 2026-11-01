import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { createApp } from "./app-harness.mjs";

const SAVE_KEY = "fortnite-sprite-checklist:v1";

test("applies a valid checklist update from another tab", async () => {
  const app = createApp();

  await app.dispatchWindow("storage", {
    key: SAVE_KEY,
    newValue: JSON.stringify({ version: 3, states: { "water-sprite": "mastered" } }),
    storageArea: app.localStorage
  });

  assert.equal(app.card("water-sprite").dataset.state, "mastered");
  assert.match(app.document.getElementById("status").innerHTML, /another browser tab/);
});

test("ignores unrelated storage events", async () => {
  const app = createApp();

  await app.dispatchWindow("storage", {
    key: "unrelated-key",
    newValue: JSON.stringify({ version: 3, states: { "water-sprite": "mastered" } }),
    storageArea: app.localStorage
  });

  assert.equal(app.card("water-sprite").dataset.state, "not-found");
});

test("keeps current progress when a cross-tab update is malformed", async () => {
  const app = createApp();
  app.evaluate('updateSpriteState(document.getElementById("water-sprite"), "found")');

  await app.dispatchWindow("storage", {
    key: SAVE_KEY,
    newValue: JSON.stringify({ version: 3, states: { "water-sprite": "invalid" } }),
    storageArea: app.localStorage
  });

  assert.equal(app.card("water-sprite").dataset.state, "found");
  assert.match(app.document.getElementById("status").innerHTML, /could not be loaded/);
});

test("syncs prior 279-state backups and mixed-season progress through the shared save", async () => {
  const previousIds = JSON.parse(fs.readFileSync(
    new URL("./fixtures/2026-10-15-sprite-ids.json", import.meta.url), "utf8"
  ));
  const states = Object.fromEntries(previousIds.map((id, index) => [
    id, ["not-found", "found", "mastered"][index % 3]
  ]));
  const app = createApp();
  const currentCards = app.document.querySelectorAll(".sprite-card")
    .filter(card => card.dataset.seasons.split(/\s+/).includes("c7ms"));
  assert.equal(previousIds.length, 279);
  assert.equal(currentCards.length, 22);
  app.evaluate(`updateSpriteState(document.getElementById(${JSON.stringify(currentCards[0].id)}), "mastered")`);

  await app.dispatchWindow("storage", {
    key: SAVE_KEY,
    newValue: JSON.stringify({ version: 3, total: 279, states }),
    storageArea: app.localStorage
  });

  for (const [id, state] of Object.entries(states)) {
    assert.equal(app.card(id).dataset.state, state, `${id} receives its prior saved state`);
  }
  assert.equal(currentCards.every(card => card.dataset.state === "not-found"), true);
  assert.equal(app.document.getElementById("seasonFilter").value, "c7ms");
  assert.equal(app.document.getElementById("collectedCount").textContent, 0);
  assert.equal(app.document.getElementById("remainingCount").textContent, 22);

  const mixedStates = {
    ...states,
    [currentCards[0].id]: "found",
    [currentCards[1].id]: "mastered"
  };
  await app.dispatchWindow("storage", {
    key: SAVE_KEY,
    newValue: JSON.stringify({ version: 3, total: 301, states: mixedStates }),
    storageArea: app.localStorage
  });

  for (const [id, state] of Object.entries(mixedStates)) {
    assert.equal(app.card(id).dataset.state, state, `${id} receives its mixed-season state`);
  }
  assert.equal(app.document.getElementById("collectedCount").textContent, 2);
  assert.equal(app.document.getElementById("masteredCount").textContent, 1);
  assert.equal(app.document.getElementById("remainingCount").textContent, 20);

  const seasonFilter = app.document.getElementById("seasonFilter");
  seasonFilter.value = "all";
  await seasonFilter.dispatch("change");
  assert.equal(app.document.getElementById("collectedCount").textContent, 188);
  assert.equal(app.document.getElementById("masteredCount").textContent, 94);
  assert.equal(app.document.getElementById("remainingCount").textContent, 113);
});
