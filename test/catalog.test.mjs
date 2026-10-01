import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { createApp } from "./app-harness.mjs";

test("matches the 239 released sprites and their Fortnite seasons", () => {
  const app = createApp();
  const catalog = JSON.parse(JSON.stringify(
    app.evaluate("sprites.map(({ id, name, src, seasons }) => ({ id, name, src, seasons }))")
  ));

  assert.equal(catalog.length, 239);
  assert.equal(new Set(catalog.map(sprite => sprite.id)).size, 239);
  assert.equal(catalog.filter(sprite => sprite.seasons.includes("c7s4")).length, 122);
  assert.equal(catalog.filter(sprite => sprite.seasons.includes("c7s3")).length, 117);
  assert.deepEqual(
    catalog.filter(sprite => sprite.seasons.includes("c7s4")).map(sprite => sprite.name),
    [
      "Spooky Dash Sprite", "Gold Spooky Dash Sprite", "Cheat Master Spooky Dash Sprite", "Loot Hacker Spooky Dash Sprite", "Bounty Hunter Spooky Dash Sprite",
      "Vampire Sprite", "Gold Vampire Sprite", "Cheat Master Vampire Sprite", "Loot Hacker Vampire Sprite", "Bounty Hunter Vampire Sprite",
      "The Deer Sprite", "Gold The Deer Sprite", "Cheat Master The Deer Sprite", "Loot Hacker The Deer Sprite", "Bounty Hunter The Deer Sprite",
      "Dumpster Dive Sprite", "Gold Dumpster Dive Sprite", "Cheat Master Dumpster Dive Sprite", "Loot Hacker Dumpster Dive Sprite", "Bounty Hunter Dumpster Dive Sprite",
      "Birthday Sprite", "Gold Birthday Sprite", "Cheat Master Birthday Sprite", "Loot Hacker Birthday Sprite", "Bounty Hunter Birthday Sprite",
      "Morgana Sprite", "Gold Morgana Sprite", "Cheat Master Morgana Sprite", "Loot Hacker Morgana Sprite", "Bounty Hunter Morgana Sprite",
      "Blinky Sprite", "Gold Blinky Sprite", "Cheat Master Blinky Sprite", "Loot Hacker Blinky Sprite", "Bounty Hunter Blinky Sprite",
      "Crash Bandicoot Sprite", "Gold Crash Bandicoot Sprite", "Cheat Master Crash Bandicoot Sprite", "Loot Hacker Crash Bandicoot Sprite", "Bounty Hunter Body Slam Sprite",
      "Pond Sprite", "Gold Pond Sprite", "Cheat Master Pond Sprite", "Loot Hacker Pond Sprite", "Bounty Hunter Pond Sprite",
      "Overshield Sprite", "Gold Overshield Sprite", "Cheat Master Overshield Sprite", "Loot Hacker Overshield Sprite", "Bounty Hunter Overshield Sprite",
      "Mega Man Sprite",
      "X-Ray Sprite", "Gold X-Ray Sprite", "Cheat Master X-Ray Sprite", "Loot Hacker X-Ray Sprite", "Bounty Hunter X-Ray Sprite",
      "Onigiri Sprite", "Gold Onigiri Sprite", "Cheat Master Onigiri Sprite", "Loot Hacker Onigiri Sprite", "Bounty Hunter Onigiri Sprite",
      "Jackrabbit Sprite", "Gold Jackrabbit Sprite", "Cheat Master Jackrabbit Sprite", "Loot Hacker Jackrabbit Sprite", "Bounty Hunter Jackrabbit Sprite",
      "Shadow Sprite", "Gold Shadow Sprite", "Cheat Master Shadow Sprite", "Loot Hacker Shadow Sprite", "Bounty Hunter Shadow Sprite",
      "Bush Sprite", "Gold Bush Sprite", "Cheat Master Bush Sprite", "Loot Hacker Bushranger Sprite", "Bounty Hunter Bush Sprite",
      "Tails Sprite", "Gold Tails Sprite", "Cheat Master Tails Sprite", "Loot Hacker Tails Sprite", "Bounty Hunter Tails Sprite",
      "Killswitch Sprite", "Gold Killswitch Sprite", "Cheat Master Killswitch Sprite", "Loot Hacker Killswitch Sprite", "Bounty Hunter Killswitch Sprite",
      "Adventure Sprite", "Gold Adventure Sprite", "Cheat Master Adventure Sprite", "Loot Hacker Adventure Sprite", "Bounty Hunter Adventure Sprite",
      "Klombo Sprite", "Gold Klombo Sprite", "Cheat Master Klombo Sprite", "Loot Hacker Klombo Sprite", "Bounty Hunter Klombo Sprite",
      "Jonesy Sprite", "Gold Jonesy Sprite", "Cheat Master Jonesy Sprite", "Loot Hacker Jonesy Sprite", "Bounty Hunter Jonesy Sprite",
      "Sonic Sprite", "Gold Sonic Sprite", "Cheat Master Sonic Sprite", "Loot Hacker Sonic Sprite", "Bounty Hunter Sonic Sprite",
      "Crown Sprite", "Gold Crown Sprite", "Cheat Master Crown Sprite", "Loot Hacker Crown Sprite", "Bounty Hunter Crown Sprite", "Trick or Treat Crown Sprite",
      "8-Bit Sprite", "Gold 8-Bit Sprite", "Cheat Master 8-Bit Sprite", "Loot Hacker 8-Bit Sprite", "Bounty Hunter 8-Bit Sprite",
      "Storm Scout Sprite", "Gold Storm Scout Sprite", "Cheat Master Storm Scout Sprite", "Loot Hacker Storm Scout Sprite", "Bounty Hunter Storm Scout Sprite"
    ]
  );
  assert.deepEqual(
    catalog.filter(sprite => [
      "batman-sprite", "holofoil-batman-sprite", "pollo", "vini-jr",
      "air-sprite", "holofoil-air-sprite", "seven-sprite", "holofoil-seven-sprite",
      "cube-batman-sprite", "cube-earth-sprite", "cube-fire-sprite", "cube-dream-sprite",
      "cube-punk-sprite", "cube-fishy-sprite", "cube-boss-sprite", "cube-grim-sprite",
      "john-wick-sprite", "ironmouse-sprite", "quack-water-sprite", "gem-water-sprite",
      "quack-earth-sprite", "gem-earth-sprite", "quack-fire-sprite", "gem-duck-sprite",
      "gem-demon-sprite", "holofoil-zero-point-sprite", "cube-zero-point-sprite",
      "quack-zero-point-sprite", "gem-zero-point-sprite", "gem-aura-sprite",
      "holofoil-grim-sprite", "gem-grim-sprite", "llama-sprite", "gold-llama-sprite", "gummy-llama-sprite",
      "galaxy-llama-sprite", "gem-llama-sprite", "peely-sprite", "gold-peely-sprite",
      "gummy-peely-sprite", "galaxy-peely-sprite", "holofoil-peely-sprite"
    ].includes(sprite.id)).map(sprite => sprite.name),
    [
      "John Wick Sprite", "Ironmouse Sprite", "Batman Sprite", "Holofoil Batman Sprite", "Cube Batman Sprite",
      "Quack Water Sprite", "Gem Water Sprite", "Cube Earth Sprite", "Quack Earth Sprite", "Gem Earth Sprite",
      "Cube Fire Sprite", "Quack Fire Sprite", "Gem Duck Sprite", "Cube Dream Sprite", "Gem Demon Sprite",
      "Cube Punk Sprite", "Holofoil Zero Point Sprite", "Cube Zero Point Sprite", "Quack Zero Point Sprite",
      "Gem Zero Point Sprite", "Cube Fishy Sprite", "Gem Aura Sprite", "Cube Boss Sprite",
      "Holofoil Grim Sprite", "Cube Grim Sprite", "Gem Grim Sprite",
      "Air Sprite", "Holofoil Air Sprite", "Seven Sprite", "Holofoil Seven Sprite",
      "Llama Sprite", "Gold Llama Sprite", "Gummy Llama Sprite", "Galaxy Llama Sprite",
      "Gem Llama Sprite", "Peeky Peely Sprite", "Gold Peeky Peely Sprite", "Gummy Peeky Peely Sprite",
      "Galaxy Peeky Peely Sprite", "Holofoil Peeky Peely Sprite", "Pollo", "Vini Jr."
    ]
  );

  const manifestFiles = Array.from(catalog, sprite => path.basename(sprite.src)).sort();
  const imageFiles = fs.readdirSync(new URL("../sprites/", import.meta.url))
    .filter(file => file.endsWith(".webp"))
    .sort();
  assert.deepEqual(imageFiles, manifestFiles);
});

test("includes only the released Crown sprite in the Trick or Treat variant", () => {
  const app = createApp();
  const trickOrTreatSprites = JSON.parse(JSON.stringify(
    app.evaluate('sprites.filter(sprite => sprite.name.startsWith("Trick or Treat ")).map(({ id, name, seasons }) => ({ id, name, seasons }))')
  ));

  assert.deepEqual(trickOrTreatSprites, [{
    id: "trick-or-treat-crown-sprite",
    name: "Trick or Treat Crown Sprite",
    seasons: ["c7s4"]
  }]);
});
