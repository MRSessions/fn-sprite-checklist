# Fortnite Sprite Checklist

An interactive fan-made checklist for tracking collected Fortnite sprites.

## Files

- `index.html` — the interactive checklist page.
- `sprites/` — individual local sprite images used by the checklist grid.
- `img_25ef196383a7.png` — legacy checklist artwork kept in the repo, but no longer used by the page.

Keep `index.html` and the `sprites/` folder together. The HTML references the sprite images by relative path.

## Saving progress

Progress is saved automatically in the user's browser using `localStorage`.

The current page uses the same save key as the previous image-overlay checklist and maps older sprite IDs into the new individual sprite cards where the sprite still exists.

Important notes:

- Saves are local to the browser and device being used.
- Clearing browser cache/site data may delete saved progress.
- Opening the page from a different domain, browser, device, or file path may use a separate save slot.
- No account login or cloud sync is included.

## Artwork disclaimer

Fortnite and related artwork are property of Epic Games, Inc. This fan-made checklist is not affiliated with, endorsed by, sponsored by, or approved by Epic Games, Inc.

## Copyright

© Doomed Gaming
