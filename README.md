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

## Photos

The venue's own photos are fetched and prepared by one command:

```bash
npm run images              # download anything missing, then process
npm run images -- --offline # only process what's already in images-src/
npm run images -- --refresh # download everything again
```

It downloads the logo, award badges and gallery photos listed in `src/data/photos.ts` into `images-src/` (git-ignored), then:

- reads each photo's real dimensions and generates AVIF and WebP at 480–2560px, **never larger than the original**;
- applies one shared warm grade so the 2015 photos sit together (film grain is added in CSS);
- writes `src/data/image-manifest.json`, which the site reads.

Each photo slot (hero, shopfront, rooms, seafood) lists its candidate photos and a minimum width in `src/data/photos.ts`. A slot only uses a photo that's sharp enough for it; otherwise that section falls back to its own artwork. Photos under 480px wide are left out of the gallery. The script prints a table of sizes and which photo landed in each slot.

**Newer photos:** drop images into `public/images/ig/` and run `npm run images`. They are preferred over the 2015 photos and appear first in the gallery. To place them in sections, tag them in `public/images/ig/captions.json`:

```json
{ "bar-at-night.jpg": { "alt": "The marble bar at night", "tags": ["interior", "bar"] } }
```

Tags: `interior`, `bar`, `shopfront`, `dish`, `seafood`, `drink`, `people`.

**If a download fails**, the slot shows a labelled placeholder naming the missing file, and the rest of the site works as normal. The deploy workflow runs `npm run images -- --if-missing` on GitHub's runners, so the live demo gets the photos even if they were never committed; once processed photos are committed, CI leaves them alone.

## Editing content

All content lives in typed data files:

| File | What's in it |
| --- | --- |
| `src/data/venue.ts` | Address, phone, email, opening hours, founders, rooms, booking link, notices |
| `src/data/menu.ts` | Tapas sections, dishes, prices and allergens |
| `src/data/drinks.ts` | Drinks tabs, measures and prices |
| `src/data/press.ts` | Review quotes, awards, mentions |
| `src/data/photos.ts` | Photo sources, alt text, slots |

Prices are plain numbers, as on the printed menu. Opening hours drive the live open/closed badge, the hours table and the booking time slots, all in Europe/London time.

## What's mocked

- **Booking panel:** party size, date and time are real UI, but submitting shows a preview card that links to the venue's existing ResDiary page and phone number. Nothing is booked.
- **Outdoor tables and private hire:** front-end validation only. The preview card offers a pre-filled email draft that the visitor sends themselves.
- **Plan your table:** a planning tool with a plate count, subtotal and 12.5% discretionary service line. It saves to the browser's local storage. There's no checkout.

## Stack

Vite, React, TypeScript and Framer Motion, with plain CSS. Fonts are self-hosted from Fontsource: Bodoni Moda for display and Instrument Sans for body text. Motion respects `prefers-reduced-motion`.
