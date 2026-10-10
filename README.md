# The Little Taperia — concept site

A speculative redesign for [The Little Taperia](https://www.thelittletaperia.co.uk/), the independent Spanish tapas bar at 143 Tooting High Street, London SW17. This is a front-end demo: everything runs on static data. Booking and enquiry forms finish in a clearly labelled preview state and never send anything.

The page has `<meta name="robots" content="noindex">` so it won't compete with the venue's real site in search.

## Run it

Requires Node 22.12 or newer.

```bash
npm install
npm run dev        # local dev server
npm run build      # typecheck and build to dist/
npm run preview    # serve the built site
npm test           # opening-hours and booking-slot tests
```

The build uses a relative base path (`base: './'`), so `dist/` works from any folder or GitHub Pages path.

## Deploy to GitHub Pages

`.github/workflows/deploy.yml` builds and deploys on every push to `main`, and can be run by hand from the **Actions** tab ("Run workflow").

One-off setup: in the repository go to **Settings → Pages** and set **Source** to **GitHub Actions**.

The workflow passes the Pages URL to the build as `SITE_URL`, so the Open Graph tags get absolute links. For other hosts, set it yourself: `SITE_URL=https://example.com/taperia/ npm run build`.

## Design

A light, editorial layout built around the venue's own photos: big type, generous space and real photography.

- **Palette:** every colour in `src/styles/tokens.css` is sampled from the opening photo of the front-room bar (`IMG_0003par.jpg`) by `npm run palette` (`scripts/palette.ts`): marble for the page, white brick for alternate bands, oak for text, copper for buttons and links, the chalkboard for the drinks list and the sage shutters for the Find us band. Their logo gold (#BD9C68) is kept for the wordmark on dark grounds. A few roles mix two sampled colours where a raw sample can't meet AA contrast as text.
- **Type:** the wordmark is set in IM Fell English Italic, the closest match to their gold logo. Headings use Fraunces, body text Source Sans 3, and Amatic SC (after the chalkboard lettering) appears only for the category names on the drinks board.
- **Layout:** a split opening screen (type on the left, the bar on the right), the press quotes side by side, the menu laid out like a printed carta with a sticky section index, and the whole drinks board laid out at once on wide screens (a tab at a time on phones).
- **Motion:** a gentle parallax on the opening photo and soft reveals as sections scroll in. Nothing else moves on its own.

## Photos

Photos are fetched and prepared by one command:

```bash
npm run images              # download anything missing, then process
npm run images -- --offline # only process what's already in images-src/
npm run images -- --refresh # download everything again
npm run images -- --strict  # fail if any download fails (used by the deploy)
```

It downloads the opening photo, the gallery photos and the award badges listed in `src/data/photos.ts` into `images-src/` (git-ignored), then:

- converts each photo as it is (no grading or effects) to AVIF and WebP at 480–2560px, **never larger than the original**;
- cuts the crops of the opening photo listed in `photoCrops`;
- writes `src/data/image-manifest.json`, which the site reads.

A photo whose original can't be fetched keeps its committed version. Sections without a suitable photo simply go without one, and the gallery (and its nav link) only appears when there are gallery photos.

Each photo slot in `src/data/photos.ts` lists its candidate photos and a minimum width, and every photo is displayed no larger than its own pixels.

**Newer photos:** drop images into `public/images/ig/` and run `npm run images`. They are preferred over the 2015 photos and appear first in the gallery. To place them in sections, tag them in `public/images/ig/captions.json`:

```json
{ "bar-at-night.jpg": { "alt": "The marble bar at night", "tags": ["interior", "bar"] } }
```

Tags: `interior`, `bar`, `shopfront`, `dish`, `seafood`, `drink`, `people`.

**On deploy** the workflow runs `npm run images -- --strict` on GitHub's runners, which downloads every photo at full size. If any download fails, the deploy stops and the previous version stays live.

## Editing content

All content lives in typed data files:

| File                 | What's in it                                                                 |
| -------------------- | ---------------------------------------------------------------------------- |
| `src/data/venue.ts`  | Address, phone, email, opening hours, founders, rooms, booking link, notices |
| `src/data/menu.ts`   | Tapas sections, dishes, prices and allergens                                 |
| `src/data/drinks.ts` | Drinks tabs, measures and prices                                             |
| `src/data/press.ts`  | Review quotes, awards, mentions                                              |
| `src/data/photos.ts` | Photo sources, alt text, slots                                               |

Prices are plain numbers, as on the printed menu. Opening hours drive the live open/closed badge, the hours table and the booking time slots, all in Europe/London time.

## What's mocked

- **Menu:** a menu to read, not a shop: no basket or ordering. The free-from filter strikes through dishes that contain the chosen allergens.
- **Booking panel:** party size, date and time are real UI, but submitting shows a preview card that links to the venue's existing ResDiary page and phone number. Nothing is booked.
- **Outdoor tables and private hire:** front-end validation only. The preview card offers a pre-filled email draft that the visitor sends themselves.

## Stack

Vite, React, TypeScript and Framer Motion, with plain CSS. Fonts are self-hosted from Fontsource. Motion respects `prefers-reduced-motion`.
