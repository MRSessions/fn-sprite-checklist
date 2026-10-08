import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { createApp } from "./app-harness.mjs";

const SAVE_KEY = "fortnite-sprite-checklist:v1";

test("defaults to the current season and scopes visible cards and stats", () => {
  const app = createApp();
  const visibleCards = app.document.querySelectorAll(".sprite-card").filter(card => !card.hidden);

  assert.equal(app.document.getElementById("seasonFilter").value, "c7s4");
  assert.equal(visibleCards.length, 145);
  assert.equal(visibleCards.every(card => card.dataset.seasons.includes("c7s4")), true);
  assert.equal(app.document.getElementById("remainingCount").textContent, 145);
  assert.match(app.document.getElementById("filterSummary").innerHTML, /of <b>145<\/b>/);
  assert.match(app.document.getElementById("filterSummary").innerHTML, /Chapter 7 Season 4/);
});

test("recalculates progress for each season and all seasons", async () => {
  const app = createApp();
  app.evaluate(`updateSpriteState(document.getElementById("jackrabbit-sprite"), "found");
    updateSpriteState(document.getElementById("water-sprite"), "mastered");
    updateProgress()`);

  assert.equal(app.document.getElementById("collectedCount").textContent, 1);
  assert.equal(app.document.getElementById("masteredCount").textContent, 0);

  const seasonFilter = app.document.getElementById("seasonFilter");
  seasonFilter.value = "c7s3";
  await seasonFilter.dispatch("change");

  assert.equal(app.document.getElementById("collectedCount").textContent, 1);
  assert.equal(app.document.getElementById("masteredCount").textContent, 1);
  assert.equal(app.document.getElementById("remainingCount").textContent, 116);

  seasonFilter.value = "all";
  await seasonFilter.dispatch("change");

  assert.equal(app.document.getElementById("collectedCount").textContent, 2);
  assert.equal(app.document.getElementById("masteredCount").textContent, 1);
  assert.equal(app.document.getElementById("remainingCount").textContent, 260);
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

test("preserves all 239 existing sprite IDs, order, and saved states when adding 23 releases", () => {
  const previousIds = JSON.parse(fs.readFileSync(
    new URL("./fixtures/2026-10-01-sprite-ids.json", import.meta.url), "utf8"
  ));
  const addedIds = [
    "trick-or-treat-spooky-dash-sprite", "trick-or-treat-vampire-sprite",
    "trick-or-treat-the-deer-sprite", "trick-or-treat-dumpster-dive-sprite",
    "trick-or-treat-birthday-sprite", "trick-or-treat-morgana-sprite",
    "trick-or-treat-blinky-sprite", "trick-or-treat-crash-bandicoot-sprite",
    "trick-or-treat-pond-sprite", "trick-or-treat-overshield-sprite",
    "trick-or-treat-x-ray-sprite", "trick-or-treat-onigiri-sprite",
    "trick-or-treat-jackrabbit-sprite", "trick-or-treat-shadow-sprite",
    "trick-or-treat-bush-sprite", "trick-or-treat-tails-sprite",
    "trick-or-treat-killswitch-sprite", "trick-or-treat-adventure-sprite",
    "trick-or-treat-klombo-sprite", "trick-or-treat-jonesy-sprite",
    "trick-or-treat-sonic-sprite", "trick-or-treat-8-bit-sprite",
    "trick-or-treat-storm-scout-sprite"
  ];
  const states = Object.fromEntries(previousIds.map((id, index) => [
    id, ["not-found", "found", "mastered"][index % 3]
  ]));
  states["bounty-hunter-body-slam-sprite"] = "mastered";
  const app = createApp({ storage: { [SAVE_KEY]: JSON.stringify({ version: 3, states }) } });
  const currentIds = Array.from(app.evaluate("sprites.map(sprite => sprite.id)"));

  assert.equal(previousIds.length, 239);
  assert.deepEqual(currentIds.filter(id => previousIds.includes(id)), previousIds);
  assert.deepEqual(currentIds.filter(id => !previousIds.includes(id)), addedIds);
  const expandedSave = JSON.parse(app.localStorage.getItem(SAVE_KEY));
  assert.equal(Object.keys(expandedSave.states).length, 262);
  assert.equal(app.card("bounty-hunter-body-slam-sprite").dataset.name, "Bounty Hunter Crash Bandicoot Sprite");
  assert.equal(app.card("bounty-hunter-body-slam-sprite").dataset.state, "mastered");
  for (const [id, state] of Object.entries(states)) {
    assert.equal(app.card(id).dataset.state, state, `${id} retained its displayed state`);
    assert.equal(expandedSave.states[id], state, `${id} retained its saved state`);
  }
  for (const id of addedIds) {
    assert.equal(app.card(id).dataset.state, "not-found", `${id} starts uncollected`);
    assert.equal(expandedSave.states[id], "not-found", `${id} saves as uncollected`);
  }
});

test("reset only clears the selected season while all seasons clears everything", async () => {
  const prompts = [];
  const app = createApp({
    confirm(message) {
      prompts.push(message);
      return true;
    }
  });
  app.evaluate(`updateSpriteState(document.getElementById("jackrabbit-sprite"), "found");
    updateSpriteState(document.getElementById("water-sprite"), "mastered");
    updateProgress()`);

  await app.document.getElementById("resetAll").dispatch("click");

  assert.equal(app.card("jackrabbit-sprite").dataset.state, "not-found");
  assert.equal(app.card("water-sprite").dataset.state, "mastered");
  assert.match(prompts[0], /Chapter 7 Season 4/);

  app.evaluate(`updateSpriteState(document.getElementById("jackrabbit-sprite"), "found");
    updateProgress()`);
  const seasonFilter = app.document.getElementById("seasonFilter");
  seasonFilter.value = "all";
  await seasonFilter.dispatch("change");
  await app.document.getElementById("resetAll").dispatch("click");

  assert.equal(app.card("jackrabbit-sprite").dataset.state, "not-found");
  assert.equal(app.card("water-sprite").dataset.state, "not-found");
  assert.match(prompts[1], /All seasons/);
});

test("supports a sprite tagged for more than one season", () => {
  const app = createApp();
  const water = app.card("water-sprite");
  water.dataset.seasons = "c7s3 c7s4";

  app.evaluate("updateProgress(); applyFilters()");

  assert.equal(water.hidden, false);
  assert.equal(app.document.getElementById("remainingCount").textContent, 146);
});

test("exposes the season selector with an accessible label", () => {
  const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");

  assert.match(html, /<select id="seasonFilter"[^>]+aria-label="Filter by season">/);
  assert.match(html, /Chapter 7 Season 4 \(Current\)/);
  assert.match(html, /<option value="all">All seasons<\/option>/);
});
