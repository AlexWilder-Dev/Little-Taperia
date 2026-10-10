/**
 * Samples the site palette from the opening photo of the front-room bar
 * (images-src/IMG_0003par.jpg) and prints it as CSS custom properties.
 *
 *   npm run palette
 *
 * Regions are fractions of the photo, so they hold for any size of the same
 * shot. The photo is warmly exposed with darker edges, so pale surfaces are
 * taken from their brightest lit pixels (a high luminance percentile) rather
 * than an average that would include shadow.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(root, 'images-src/IMG_0003par.jpg');

type RGB = [number, number, number];
type Box = [number, number, number, number]; // x0, y0, x1, y1 as fractions
type Keep = (rgb: RGB, hsl: [number, number, number]) => boolean;

interface Sample {
  token: string;
  what: string;
  boxes: Box[];
  keep?: Keep;
  /** Luminance band to take the median of, as [from, to] percentiles. */
  band?: [number, number];
  /** Or rank by saturation and take the median of the most saturated fraction. */
  mostSaturated?: number;
}

const hsl = ([r, g, b]: RGB): [number, number, number] => {
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === R ? (G - B) / d + (G < B ? 6 : 0) : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
  return [h * 60, s, l];
};

const luminance = ([r, g, b]: RGB) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const reddish = (h: number) => h >= 330 || h <= 20;

// Areas of the photo, as fractions of width and height
const BRICK: Box = [0.45, 0.345, 0.518, 0.474]; // white brick seen in the mirror
const BAR_TOP: Box = [0.044, 0.658, 0.985, 0.697];
const BAR_FRONT: Box = [0.044, 0.737, 0.985, 0.974];
const HOOKS: Box = [0.044, 0.708, 0.882, 0.732];
const WALL: Box[] = [
  [0.371, 0.224, 0.41, 0.513], // beside the mirror
  [0.279, 0.026, 0.588, 0.138], // above the shelves
  [0.816, 0.053, 0.985, 0.197], // right of the shelves
  [0.706, 0.026, 0.809, 0.184],
];
const PENDANTS: Box[] = [
  [0.25, 0.243, 0.368, 0.309],
  [0.941, 0.257, 1, 0.322],
];
const SHUTTERS: Box[] = [
  [0.408, 0.25, 0.45, 0.484],
  [0.519, 0.316, 0.56, 0.484],
  [0.412, 0.25, 0.555, 0.332],
  [0.434, 0.484, 0.559, 0.524],
];
const BOARD: Box = [0, 0.263, 0.147, 0.539];

const samples: Sample[] = [
  { token: '--brick', what: 'white-painted brick, lit', boxes: [BRICK], band: [0.97, 0.99] },
  { token: '--marble', what: 'marble bar top, brightest', boxes: [BAR_TOP], band: [0.99, 1] },
  {
    token: '--wall',
    what: 'cream wall, lit',
    boxes: WALL,
    keep: (_, [h, s]) => h < 40 && s > 0.08,
    band: [0.97, 0.99],
  },
  { token: '--oak', what: 'reclaimed oak bar front, median', boxes: [BAR_FRONT], band: [0.45, 0.55] },
  { token: '--oak-light', what: 'bar front planks in light', boxes: [BAR_FRONT], band: [0.85, 0.95] },
  { token: '--oak-dark', what: 'bar front planks in shadow', boxes: [BAR_FRONT], band: [0.05, 0.15] },
  {
    token: '--copper',
    what: 'copper dome pendants',
    boxes: PENDANTS,
    keep: (_, [h, s, l]) => h >= 8 && h <= 40 && s > 0.3 && l > 0.35 && l < 0.85,
    band: [0.4, 0.6],
  },
  {
    token: '--brass',
    what: 'brass hooks on the bar front',
    boxes: [HOOKS],
    keep: (_, [h, s, l]) => h >= 30 && h <= 55 && s > 0.35 && l > 0.35,
    band: [0.5, 0.8],
  },
  {
    token: '--sage',
    what: 'shuttered mirror frame, green-leaning pixels',
    boxes: SHUTTERS,
    keep: ([r, g, b]) => g >= r - 2 && g >= b,
    band: [0, 1],
  },
  {
    token: '--board',
    what: 'chalkboard, between the lettering',
    boxes: [BOARD],
    keep: (_, [, s]) => s < 0.15,
    band: [0.05, 0.15],
  },
  {
    token: '--chalk',
    what: 'white chalk lettering',
    boxes: [BOARD],
    keep: (_, [, s]) => s < 0.15,
    band: [0.985, 0.995],
  },
  {
    token: '--chalk-pink',
    what: 'pink chalk lettering',
    boxes: [BOARD],
    keep: (_, [h, s, l]) => reddish(h) && l > 0.55 && s > 0.15,
    band: [0, 1],
  },
  {
    token: '--chalk-red',
    what: 'red chalk lettering',
    boxes: [BOARD],
    keep: (_, [h, , l]) => reddish(h) && l > 0.3,
    mostSaturated: 0.1,
  },
];

const hex = (rgb: RGB) => `#${rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}`;

async function main() {
  if (!existsSync(SOURCE)) {
    console.error(`Missing ${path.relative(root, SOURCE)} — run npm run images first.`);
    process.exitCode = 1;
    return;
  }
  const { data, info } = await sharp(SOURCE).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  console.log(`/* Sampled from IMG_0003par.jpg (${width}×${height}) by scripts/palette.ts */`);
  for (const sample of samples) {
    const pixels: { rgb: RGB; s: number }[] = [];
    for (const [fx0, fy0, fx1, fy1] of sample.boxes) {
      const [x0, y0] = [Math.round(fx0 * width), Math.round(fy0 * height)];
      const [x1, y1] = [Math.round(fx1 * width), Math.round(fy1 * height)];
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = (y * width + x) * channels;
          const rgb: RGB = [data[i], data[i + 1], data[i + 2]];
          const h = hsl(rgb);
          if (!sample.keep || sample.keep(rgb, h)) pixels.push({ rgb, s: h[1] });
        }
      }
    }
    let chosen: RGB[];
    if (sample.mostSaturated) {
      pixels.sort((a, b) => b.s - a.s);
      chosen = pixels.slice(0, Math.ceil(pixels.length * sample.mostSaturated)).map((p) => p.rgb);
    } else {
      pixels.sort((a, b) => luminance(a.rgb) - luminance(b.rgb));
      const [from, to] = sample.band ?? [0, 1];
      const start = Math.floor(pixels.length * from);
      chosen = pixels.slice(start, Math.max(start + 1, Math.floor(pixels.length * to))).map((p) => p.rgb);
    }
    const median = (k: number) => chosen.map((p) => p[k]).sort((a, b) => a - b)[Math.floor(chosen.length / 2)];
    const rgb: RGB = [median(0), median(1), median(2)];
    console.log(`  ${`${sample.token}: ${hex(rgb)};`.padEnd(24)} /* ${sample.what} (${pixels.length} px) */`);
  }
}

main();
