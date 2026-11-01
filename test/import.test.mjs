import assert from "node:assert/strict";
import fs from "node:fs";
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

test("imports and exports all 279 prior states while new-season sprites start uncollected", async () => {
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

  const input = app.document.getElementById("importFile");
  input.files = [{
    name: "prior-season-backup.json",
    text: async () => JSON.stringify({ version: 3, total: 279, states })
  }];
  await input.dispatch("change");

  const saved = JSON.parse(app.localStorage.getItem("fortnite-sprite-checklist:v1"));
  assert.equal(saved.version, 3);
  assert.equal(saved.total, 301);
  assert.equal(Object.keys(saved.states).length, 301);
  for (const [id, state] of Object.entries(states)) {
    assert.equal(app.card(id).dataset.state, state, `${id} imported its prior state`);
    assert.equal(saved.states[id], state, `${id} saved its prior state`);
  }
  for (const card of currentCards) {
    assert.equal(card.dataset.state, "not-found", `${card.id} is absent from the prior backup`);
    assert.equal(saved.states[card.id], "not-found");
  }
  assert.equal(app.document.getElementById("collectedCount").textContent, 0);
  assert.equal(app.document.getElementById("remainingCount").textContent, 22);

  await app.document.getElementById("exportFile").dispatch("click");
  assert.equal(app.exportedBlobs.length, 1);
  const exported = JSON.parse(await app.exportedBlobs[0].text());
  assert.equal(exported.version, 3);
  assert.equal(exported.total, 301);
  assert.deepEqual(exported.states, saved.states);
  assert.deepEqual(exported.checked, saved.checked);

  const restored = createApp();
  const restoredInput = restored.document.getElementById("importFile");
  restoredInput.files = [{
    name: "exported-backup.json",
    text: async () => JSON.stringify(exported)
  }];
  await restoredInput.dispatch("change");
  for (const [id, state] of Object.entries(exported.states)) {
    assert.equal(restored.card(id).dataset.state, state, `${id} survives the export/import round trip`);
  }
});
