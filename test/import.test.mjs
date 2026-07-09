import assert from "node:assert/strict";
import test from "node:test";

import { createApp } from "./app-harness.mjs";

test("rejects empty and unrelated backup objects", () => {
  const app = createApp();
  assert.throws(() => app.evaluate("validateImportData({})"), /recognized sprites/);
  assert.throws(() => app.evaluate('validateImportData({ unrelated: "data" })'), /recognized sprites/);
});

test("rejects malformed and unsupported backup data", () => {
  const app = createApp();
  assert.throws(
    () => app.evaluate('validateImportData({ version: 3, states: { "water-sprite": "complete" } })'),
    /invalid state/
  );
  assert.throws(
    () => app.evaluate('validateImportData({ version: 99, states: { "water-sprite": "found" } })'),
    /not supported/
  );
});

test("accepts current and legacy backups and calculates replacement totals", () => {
  const app = createApp();
  assert.doesNotThrow(() => app.evaluate(`validateImportData({
    version: 3,
    states: { "water-sprite": "found", "gold-water-sprite": "mastered" }
  })`));
  assert.deepEqual(
    { ...app.evaluate(`importedProgressCounts({
      version: 3,
      states: { "water-sprite": "found", "gold-water-sprite": "mastered" }
    })`) },
    { collected: 2, mastered: 1 }
  );
  assert.doesNotThrow(() => app.evaluate('validateImportData({ "water-sprites-cyan": true })'));
});

test("canceling a valid import leaves current progress unchanged", async () => {
  const app = createApp({ confirm: () => false });
  app.evaluate('updateSpriteState(document.getElementById("water-sprite"), "mastered")');
  const input = app.document.getElementById("importFile");
  input.files = [{
    name: "replacement.json",
    text: async () => JSON.stringify({ version: 3, states: { "water-sprite": "not-found" } })
  }];

  await input.dispatch("change");

  assert.equal(app.card("water-sprite").dataset.state, "mastered");
  assert.match(app.document.getElementById("status").innerHTML, /Import canceled/);
});

test("confirming a valid import applies and saves the replacement", async () => {
  const app = createApp();
  const input = app.document.getElementById("importFile");
  input.files = [{
    name: "replacement.json",
    text: async () => JSON.stringify({
      version: 3,
      states: { "water-sprite": "found", "gold-water-sprite": "mastered" }
    })
  }];

  await input.dispatch("change");

  assert.equal(app.card("water-sprite").dataset.state, "found");
  assert.equal(app.card("gold-water-sprite").dataset.state, "mastered");
  const saved = JSON.parse(app.localStorage.getItem("fortnite-sprite-checklist:v1"));
  assert.equal(saved.states["water-sprite"], "found");
  assert.equal(saved.states["gold-water-sprite"], "mastered");
});
