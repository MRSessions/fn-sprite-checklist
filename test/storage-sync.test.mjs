import assert from "node:assert/strict";
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
