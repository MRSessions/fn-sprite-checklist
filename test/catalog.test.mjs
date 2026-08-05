import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { createApp } from "./app-harness.mjs";

test("matches the 110 released sprites in the Fortnite.GG catalog", () => {
  const app = createApp();
  const catalog = app.evaluate("sprites.map(({ id, name, src }) => ({ id, name, src }))");

  assert.equal(catalog.length, 110);
  assert.deepEqual(
    Array.from(catalog).filter(sprite => [
      "batman-sprite", "holofoil-batman-sprite", "pollo", "vini-jr",
      "air-sprite", "holofoil-air-sprite", "seven-sprite", "holofoil-seven-sprite",
      "cube-batman-sprite", "cube-earth-sprite", "cube-fire-sprite", "cube-dream-sprite",
      "cube-punk-sprite", "cube-fishy-sprite", "cube-boss-sprite", "cube-grim-sprite",
      "john-wick-sprite", "ironmouse-sprite", "quack-water-sprite", "quack-earth-sprite", "quack-fire-sprite",
      "holofoil-zero-point-sprite", "cube-zero-point-sprite", "quack-zero-point-sprite",
      "holofoil-grim-sprite", "llama-sprite", "gold-llama-sprite", "gummy-llama-sprite",
      "galaxy-llama-sprite", "gem-llama-sprite", "peely-sprite", "gold-peely-sprite",
      "gummy-peely-sprite", "galaxy-peely-sprite", "holofoil-peely-sprite"
    ].includes(sprite.id)).map(sprite => sprite.name),
    [
      "John Wick Sprite", "Ironmouse Sprite", "Batman Sprite", "Holofoil Batman Sprite", "Cube Batman Sprite",
      "Quack Water Sprite", "Cube Earth Sprite", "Quack Earth Sprite",
      "Cube Fire Sprite", "Quack Fire Sprite", "Cube Dream Sprite", "Cube Punk Sprite",
      "Holofoil Zero Point Sprite", "Cube Zero Point Sprite", "Quack Zero Point Sprite",
      "Cube Fishy Sprite", "Cube Boss Sprite", "Holofoil Grim Sprite", "Cube Grim Sprite",
      "Air Sprite", "Holofoil Air Sprite", "Seven Sprite", "Holofoil Seven Sprite",
      "Llama Sprite", "Gold Llama Sprite", "Gummy Llama Sprite", "Galaxy Llama Sprite",
      "Gem Llama Sprite", "Peely Sprite", "Gold Peely Sprite", "Gummy Peely Sprite",
      "Galaxy Peely Sprite", "Holofoil Peely Sprite", "Pollo", "Vini Jr."
    ]
  );

  const manifestFiles = Array.from(catalog, sprite => path.basename(sprite.src)).sort();
  const imageFiles = fs.readdirSync(new URL("../sprites/", import.meta.url))
    .filter(file => file.endsWith(".webp"))
    .sort();
  assert.deepEqual(imageFiles, manifestFiles);
});
