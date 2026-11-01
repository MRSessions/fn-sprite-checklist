import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { createApp } from "./app-harness.mjs";

const SAVE_KEY = "fortnite-sprite-checklist:v1";

test("defaults to the current season and scopes visible cards and stats", () => {
  const app = createApp();
  const visibleCards = app.document.querySelectorAll(".sprite-card").filter(card => !card.hidden);

  assert.equal(app.document.getElementById("seasonFilter").value, "c7ms");
  assert.equal(visibleCards.length, 22);
  assert.equal(visibleCards.every(card => card.dataset.seasons.includes("c7ms")), true);
  assert.equal(app.document.getElementById("remainingCount").textContent, 22);
  assert.match(app.document.getElementById("filterSummary").innerHTML, /of <b>22<\/b>/);
  assert.match(app.document.getElementById("filterSummary").innerHTML, /Chapter 7 Mini Season \(Current\)/);
  assert.equal(app.document.querySelectorAll(".sprite-group").filter(group => !group.hidden).length, 12);
});

test("recalculates progress for each of the three seasons and all seasons", async () => {
  const app = createApp();
  app.evaluate(`updateSpriteState(document.getElementById("halfpeel-d-sprite"), "found");
    updateSpriteState(document.getElementById("jackrabbit-sprite"), "found");
    updateSpriteState(document.getElementById("water-sprite"), "mastered");
    updateProgress()`);

  assert.equal(app.document.getElementById("collectedCount").textContent, 1);
  assert.equal(app.document.getElementById("masteredCount").textContent, 0);
  assert.equal(app.document.getElementById("remainingCount").textContent, 21);

  const seasonFilter = app.document.getElementById("seasonFilter");
  seasonFilter.value = "c7s4";
  await seasonFilter.dispatch("change");

  assert.equal(app.document.getElementById("collectedCount").textContent, 1);
  assert.equal(app.document.getElementById("masteredCount").textContent, 0);
  assert.equal(app.document.getElementById("remainingCount").textContent, 161);

  seasonFilter.value = "c7s3";
  await seasonFilter.dispatch("change");

  assert.equal(app.document.getElementById("collectedCount").textContent, 1);
  assert.equal(app.document.getElementById("masteredCount").textContent, 1);
  assert.equal(app.document.getElementById("remainingCount").textContent, 116);

  seasonFilter.value = "all";
  await seasonFilter.dispatch("change");

  assert.equal(app.document.getElementById("collectedCount").textContent, 3);
  assert.equal(app.document.getElementById("masteredCount").textContent, 1);
  assert.equal(app.document.getElementById("remainingCount").textContent, 298);
});

test("loads an existing 117-entry save without changing past progress", async () => {
  const app = createApp({
    storage: {
      [SAVE_KEY]: JSON.stringify({
        version: 3,
        states: { "water-sprite": "found", "gold-water-sprite": "mastered" }
      })
    }
  });

  assert.equal(app.card("water-sprite").dataset.state, "found");
  assert.equal(app.card("gold-water-sprite").dataset.state, "mastered");
  assert.equal(app.card("jackrabbit-sprite").dataset.state, "not-found");
  assert.equal(app.document.getElementById("collectedCount").textContent, 0);

  const seasonFilter = app.document.getElementById("seasonFilter");
  seasonFilter.value = "c7s3";
  await seasonFilter.dispatch("change");

  assert.equal(app.document.getElementById("collectedCount").textContent, 2);
  assert.equal(app.document.getElementById("masteredCount").textContent, 1);

  const expandedSave = JSON.parse(app.localStorage.getItem(SAVE_KEY));
  assert.equal(expandedSave.states["water-sprite"], "found");
  assert.equal(expandedSave.states["gold-water-sprite"], "mastered");
  assert.equal(expandedSave.states["jackrabbit-sprite"], "not-found");
});

test("preserves all 279 existing sprite IDs, order, and saved states when adding 22 releases", () => {
  const previousIds = JSON.parse(fs.readFileSync(
    new URL("./fixtures/2026-10-15-sprite-ids.json", import.meta.url), "utf8"
  ));
  const addedIds = [
    "halfpeel-d-sprite", "fortune-halfpeel-d-sprite", "re-pete-sprite", "fortune-re-pete-sprite",
    "barry-o-fish-sprite", "fortune-barry-o-fish-sprite", "chester-sprite", "fortune-chester-sprite",
    "exmarks-sprite", "fortune-exmarks-sprite", "wayfinder-sprite", "fortune-wayfinder-sprite",
    "kelper-sprite", "fortune-kelper-sprite", "sweet-dreams-sprite",
    "lil-squibbly-sprite", "fortune-lil-squibbly-sprite", "lil-flacko-sprite", "fortune-lil-flacko-sprite",
    "plundarrgh-sprite", "fortune-plundarrgh-sprite", "transponder-snail-sprite"
  ];
  const states = Object.fromEntries(previousIds.map((id, index) => [
    id, ["not-found", "found", "mastered"][index % 3]
  ]));
  states["bounty-hunter-body-slam-sprite"] = "mastered";
  states["loot-hacker-bush-sprite"] = "mastered";
  states["trick-or-treat-bush-sprite"] = "mastered";
  const app = createApp({ storage: { [SAVE_KEY]: JSON.stringify({ version: 3, states }) } });
  const currentIds = Array.from(app.evaluate("sprites.map(sprite => sprite.id)"));

  assert.equal(previousIds.length, 279);
  assert.deepEqual(currentIds.filter(id => previousIds.includes(id)), previousIds);
  assert.deepEqual(currentIds.filter(id => !previousIds.includes(id)), addedIds);
  const expandedSave = JSON.parse(app.localStorage.getItem(SAVE_KEY));
  assert.equal(Object.keys(expandedSave.states).length, 301);
  assert.equal(app.evaluate("LS_KEY"), SAVE_KEY);
  assert.equal(expandedSave.version, 3);
  assert.equal(app.card("bounty-hunter-body-slam-sprite").dataset.name, "Bounty Hunter Crash Bandicoot Sprite");
  assert.equal(app.card("bounty-hunter-body-slam-sprite").dataset.state, "mastered");
  assert.equal(app.card("loot-hacker-bush-sprite").dataset.name, "Loot Hacker Bush Sprite");
  assert.equal(app.card("loot-hacker-bush-sprite").dataset.state, "mastered");
  assert.equal(app.card("trick-or-treat-bush-sprite").dataset.name, "Trick or Treat Bush Sprite");
  assert.equal(app.card("trick-or-treat-bush-sprite").dataset.state, "mastered");
  for (const [id, state] of Object.entries(states)) {
    assert.equal(app.card(id).dataset.state, state, `${id} retained its displayed state`);
    assert.equal(expandedSave.states[id], state, `${id} retained its saved state`);
  }
  for (const id of addedIds) {
    assert.equal(app.card(id).dataset.state, "not-found", `${id} starts uncollected`);
    assert.equal(expandedSave.states[id], "not-found", `${id} saves as uncollected`);
  }
});

test("reset isolates each of the three seasons while all seasons clears everything", async () => {
  const prompts = [];
  const app = createApp({
    confirm(message) {
      prompts.push(message);
      return true;
    }
  });
  app.evaluate(`updateSpriteState(document.getElementById("halfpeel-d-sprite"), "found");
    updateSpriteState(document.getElementById("jackrabbit-sprite"), "found");
    updateSpriteState(document.getElementById("water-sprite"), "mastered");
    updateProgress()`);

  await app.document.getElementById("resetAll").dispatch("click");

  assert.equal(app.card("halfpeel-d-sprite").dataset.state, "not-found");
  assert.equal(app.card("jackrabbit-sprite").dataset.state, "found");
  assert.equal(app.card("water-sprite").dataset.state, "mastered");
  assert.match(prompts[0], /Chapter 7 Mini Season/);

  app.evaluate(`updateSpriteState(document.getElementById("halfpeel-d-sprite"), "found");
    updateProgress()`);
  const seasonFilter = app.document.getElementById("seasonFilter");
  seasonFilter.value = "c7s4";
  await seasonFilter.dispatch("change");
  await app.document.getElementById("resetAll").dispatch("click");

  assert.equal(app.card("halfpeel-d-sprite").dataset.state, "found");
  assert.equal(app.card("jackrabbit-sprite").dataset.state, "not-found");
  assert.equal(app.card("water-sprite").dataset.state, "mastered");
  assert.match(prompts[1], /Chapter 7 Season 4/);

  app.evaluate('updateSpriteState(document.getElementById("jackrabbit-sprite"), "found")');
  seasonFilter.value = "c7s3";
  await seasonFilter.dispatch("change");
  await app.document.getElementById("resetAll").dispatch("click");

  assert.equal(app.card("halfpeel-d-sprite").dataset.state, "found");
  assert.equal(app.card("jackrabbit-sprite").dataset.state, "found");
  assert.equal(app.card("water-sprite").dataset.state, "not-found");
  assert.match(prompts[2], /Chapter 7 Season 3/);

  app.evaluate('updateSpriteState(document.getElementById("water-sprite"), "mastered")');
  seasonFilter.value = "all";
  await seasonFilter.dispatch("change");
  await app.document.getElementById("resetAll").dispatch("click");

  assert.equal(app.card("halfpeel-d-sprite").dataset.state, "not-found");
  assert.equal(app.card("jackrabbit-sprite").dataset.state, "not-found");
  assert.equal(app.card("water-sprite").dataset.state, "not-found");
  assert.match(prompts[3], /All seasons/);
});

test("loads legacy checked saves without moving old progress into the new season", () => {
  const previousIds = JSON.parse(fs.readFileSync(
    new URL("./fixtures/2026-10-15-sprite-ids.json", import.meta.url), "utf8"
  ));
  const checked = Object.fromEntries(previousIds.map((id, index) => [id, index % 2 === 0]));
  const app = createApp({ storage: { [SAVE_KEY]: JSON.stringify({ version: 1, checked }) } });
  const expandedSave = JSON.parse(app.localStorage.getItem(SAVE_KEY));

  assert.equal(expandedSave.version, 3);
  assert.equal(Object.keys(expandedSave.states).length, 301);
  for (const [id, collected] of Object.entries(checked)) {
    const expected = collected ? "found" : "not-found";
    assert.equal(app.card(id).dataset.state, expected, `${id} retains its legacy checked value`);
    assert.equal(expandedSave.states[id], expected);
  }
  const currentCards = app.document.querySelectorAll(".sprite-card").filter(card => card.dataset.seasons.includes("c7ms"));
  assert.equal(currentCards.length, 22);
  assert.equal(currentCards.every(card => card.dataset.state === "not-found"), true);
  assert.equal(app.document.getElementById("collectedCount").textContent, 0);

  const overlaySave = createApp({ storage: { [SAVE_KEY]: JSON.stringify({ "water-sprites-cyan": true }) } });
  assert.equal(overlaySave.card("water-sprite").dataset.state, "found");
  assert.equal(overlaySave.card("halfpeel-d-sprite").dataset.state, "not-found");
});

test("supports a sprite tagged for more than one season", () => {
  const app = createApp();
  const water = app.card("water-sprite");
  water.dataset.seasons = "c7s3 c7ms";

  app.evaluate("updateProgress(); applyFilters()");

  assert.equal(water.hidden, false);
  assert.equal(app.document.getElementById("remainingCount").textContent, 23);
});

test("exposes the season selector with an accessible label", () => {
  const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");

  assert.match(html, /<select id="seasonFilter"[^>]+aria-label="Filter by season">/);
  assert.match(html, /Chapter 7 Mini Season \(Current\)/);
  assert.match(html, /<option value="c7s4">Chapter 7 Season 4<\/option>/);
  assert.match(html, /<option value="c7s3">Chapter 7 Season 3<\/option>/);
  assert.match(html, /<option value="all">All seasons<\/option>/);
});
