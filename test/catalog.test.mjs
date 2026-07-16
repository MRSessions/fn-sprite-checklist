import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { createApp } from "./app-harness.mjs";

test("matches the 83 released sprites in the Fortnite.GG catalog", () => {
  const app = createApp();
  const catalog = app.evaluate("sprites.map(({ id, name, src }) => ({ id, name, src }))");

  assert.equal(catalog.length, 83);
  assert.deepEqual(
    Array.from(catalog).filter(sprite => [
      "batman-sprite", "holofoil-batman-sprite", "pollo", "vini-jr",
      "air-sprite", "holofoil-air-sprite", "seven-sprite", "holofoil-seven-sprite"
    ].includes(sprite.id)).map(sprite => sprite.name),
    [
      "Batman Sprite", "Holofoil Batman Sprite", "Air Sprite", "Holofoil Air Sprite",
      "Seven Sprite", "Holofoil Seven Sprite", "Pollo", "Vini Jr."
    ]
  );

  const manifestFiles = Array.from(catalog, sprite => path.basename(sprite.src)).sort();
  const imageFiles = fs.readdirSync(new URL("../sprites/", import.meta.url))
    .filter(file => file.endsWith(".webp"))
    .sort();
  assert.deepEqual(imageFiles, manifestFiles);
});
