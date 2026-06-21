# Fortnite Sprite Checklist

An interactive fan-made checklist for tracking collected Fortnite sprites.

## Files

- `fortnite_sprite_checklist.html` — the interactive checklist page.
- `img_25ef196383a7.png` — the checklist artwork/image used by the page.

Keep both files in the same directory. The HTML references the image by relative path, so the image file must stay next to the HTML file unless you update the `<img src="...">` path.

## GitHub Pages usage

1. Upload these files to your GitHub Pages repository:
   - `fortnite_sprite_checklist.html`
   - `img_25ef196383a7.png`
   - `README.md`
2. Enable GitHub Pages for the repository or branch.
3. Open `fortnite_sprite_checklist.html` from your published GitHub Pages URL.

If you want the page to load as the default home page, rename:

```text
fortnite_sprite_checklist.html
```

to:

```text
index.html
```

## Saving progress

Progress is saved automatically in the user's browser using `localStorage`.

Important notes:

- Saves are local to the browser and device being used.
- Clearing browser cache/site data may delete saved progress.
- Opening the page from a different domain, browser, device, or file path may use a separate save slot.
- No account login or cloud sync is included.

## Artwork disclaimer

Fortnite and related artwork are property of Epic Games, Inc. This fan-made checklist is not affiliated with, endorsed by, sponsored by, or approved by Epic Games, Inc.

## Copyright

© Doomed Gaming
