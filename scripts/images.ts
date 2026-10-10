/**
 * Downloads the venue's photos and logo, converts them to responsive AVIF/WebP
 * and writes src/data/image-manifest.json with their real dimensions.
 *
 *   npm run images              download anything missing, then process
 *   npm run images -- --offline only process what is already in images-src/
 *   npm run images -- --refresh download everything again
 *   npm run images -- --if-missing  skip if photos are already processed (used in CI)
 *
 * Newer photos placed in public/images/ig/ are processed too (see
 * src/data/photos.ts for the optional captions.json).
 *
 * The script never fails the build: anything that can't be fetched is
 * reported and the site shows a labelled placeholder in its place.
 */
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp, { type Sharp } from 'sharp';
import { brandSources, galleryTiers, photoSources, slots, type PhotoTag } from '../src/data/photos.ts';
import { resolveSlots, type BrandEntry, type ImageEntry, type Manifest } from '../src/lib/slots.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = path.join(root, 'images-src');
const IG_DIR = path.join(root, 'public/images/ig');
const OUT_PHOTOS = path.join(root, 'public/images/photos');
const OUT_BRAND = path.join(root, 'public/images/brand');
const MANIFEST = path.join(root, 'src/data/image-manifest.json');

const args = new Set(process.argv.slice(2));
const offline = args.has('--offline');
const refresh = args.has('--refresh');
const ifMissing = args.has('--if-missing');

/** Output widths; each photo gets those below its own width, plus its own width. */
const WIDTHS = [480, 768, 1080, 1440, 1920, 2560];
const MAX_WIDTH = 2560;
const IMAGE_EXT = /\.(jpe?g|png|webp|avif|tiff?)$/i;

const problems: string[] = [];

async function download(url: string, dest: string) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(30_000),
    headers: { 'user-agent': 'Mozilla/5.0 (compatible; site image build)' },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const type = response.headers.get('content-type') ?? '';
  if (!type.startsWith('image/')) throw new Error(`not an image (${type || 'no content type'})`);
  const buffer = Buffer.from(await response.arrayBuffer());
  await sharp(buffer).metadata(); // throws on a corrupt file
  await writeFile(dest, buffer);
}

async function fetchAll() {
  await mkdir(SRC_DIR, { recursive: true });
  if (offline) return;
  const queue = [...photoSources, ...brandSources].filter(
    (source) => refresh || !existsSync(path.join(SRC_DIR, source.file)),
  );
  // A few at a time, so a slow host can't stall the build for long
  const worker = async () => {
    for (let source = queue.shift(); source; source = queue.shift()) {
      try {
        await download(source.url, path.join(SRC_DIR, source.file));
        console.log(`  downloaded  ${source.file}`);
      } catch (error) {
        const reason =
          error instanceof Error ? (error.cause instanceof Error ? error.cause.message : error.message) : String(error);
        problems.push(`${source.file}: download failed (${reason})`);
        console.log(`  FAILED      ${source.file} — ${reason}`);
      }
    }
  };
  await Promise.all(Array.from({ length: 4 }, worker));
}

const hex = (n: number) => Math.round(n).toString(16).padStart(2, '0');

/**
 * One warm grade for every photo so 2015 shots and newer ones sit together:
 * slightly muted saturation, a nudge toward amber and a touch of contrast.
 * (Grain is added in CSS, so it stays crisp and doesn't bloat the files.)
 */
function grade(image: Sharp) {
  return image
    .modulate({ saturation: 0.9, brightness: 0.98 })
    .recomb([
      [1.05, 0.03, 0],
      [0.01, 1.0, 0],
      [0, 0.03, 0.88],
    ])
    .linear(1.05, -6);
}

interface PhotoMeta {
  id: string;
  origin: ImageEntry['origin'];
  alt: string;
  tags: string[];
  order: number;
}

async function processPhoto(file: string, meta: PhotoMeta): Promise<ImageEntry> {
  // Orient, flatten and normalise once, then work from the decoded pixels
  const { data, info } = await sharp(file, { failOn: 'none' })
    .rotate()
    .flatten({ background: '#0b0806' })
    .toColourspace('srgb')
    .raw()
    .toBuffer({ resolveWithObject: true });
  const raw = { raw: { width: info.width, height: info.height, channels: info.channels } } as const;
  const graded = await grade(sharp(data, raw)).toBuffer();
  const gradedRaw = { raw: { width: info.width, height: info.height, channels: info.channels } } as const;

  const top = Math.min(info.width, MAX_WIDTH);
  const widths = [...WIDTHS.filter((w) => w < top), top];

  for (const width of widths) {
    const resized = sharp(graded, gradedRaw).resize({ width, withoutEnlargement: true });
    await resized
      .clone()
      .avif({ quality: 52, effort: 4 })
      .toFile(path.join(OUT_PHOTOS, `${meta.id}-${width}.avif`));
    await resized
      .clone()
      .webp({ quality: 74 })
      .toFile(path.join(OUT_PHOTOS, `${meta.id}-${width}.webp`));
  }

  const lqip = await sharp(graded, gradedRaw).resize({ width: 24 }).blur(1.2).webp({ quality: 40 }).toBuffer();
  const { dominant } = await sharp(graded, gradedRaw).stats();

  return {
    id: meta.id,
    origin: meta.origin,
    w: info.width,
    h: info.height,
    widths,
    lqip: `data:image/webp;base64,${lqip.toString('base64')}`,
    color: `#${hex(dominant.r)}${hex(dominant.g)}${hex(dominant.b)}`,
    alt: meta.alt,
    tags: meta.tags,
    order: meta.order,
  };
}

async function processBrand(file: string, id: string): Promise<BrandEntry> {
  const metadata = await sharp(file).metadata();
  const stats = await sharp(file).stats();
  const alpha = metadata.hasAlpha ? stats.channels[3] : undefined;
  // Maskable only if the logo really has transparent areas around it
  const maskable = Boolean(alpha && alpha.min < 20);
  const height = Math.min(metadata.height ?? 400, 400);
  const pipeline = sharp(file).resize({ height, withoutEnlargement: true });
  const png = await pipeline
    .clone()
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT_BRAND, `${id}.png`));
  await pipeline
    .clone()
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(path.join(OUT_BRAND, `${id}.webp`));
  return { file: `${id}.png`, webp: `${id}.webp`, w: png.width, h: png.height, maskable };
}

const slug = (name: string) =>
  name
    .replace(IMAGE_EXT, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

interface Caption {
  alt?: string;
  tags?: PhotoTag[];
}

async function instagramPhotos(): Promise<{ file: string; meta: PhotoMeta }[]> {
  if (!existsSync(IG_DIR)) return [];
  const files = (await readdir(IG_DIR)).filter((f) => IMAGE_EXT.test(f)).sort();
  let captions: Record<string, Caption> = {};
  const captionsFile = path.join(IG_DIR, 'captions.json');
  if (existsSync(captionsFile)) {
    try {
      captions = JSON.parse(await readFile(captionsFile, 'utf8'));
    } catch {
      problems.push('public/images/ig/captions.json: not valid JSON, ignored');
    }
  }
  return files.map((file, order) => ({
    file: path.join(IG_DIR, file),
    meta: {
      id: `ig-${slug(file)}`,
      origin: 'ig',
      alt: captions[file]?.alt ?? 'At The Little Taperia',
      tags: captions[file]?.tags ?? [],
      order,
    },
  }));
}

function tier(w: number) {
  if (w >= galleryTiers.feature) return 'large';
  if (w >= galleryTiers.standard) return 'standard';
  if (w >= galleryTiers.min) return 'small only';
  return 'too small — left out';
}

async function main() {
  if (ifMissing) {
    const current = JSON.parse(await readFile(MANIFEST, 'utf8')) as Manifest;
    if (Object.keys(current.photos).length > 0) {
      console.log('Photos already processed and committed; skipping.');
      return;
    }
  }
  console.log(offline ? 'Processing images (offline)…' : 'Fetching images…');
  await fetchAll();

  await rm(OUT_PHOTOS, { recursive: true, force: true });
  await rm(OUT_BRAND, { recursive: true, force: true });
  await mkdir(OUT_PHOTOS, { recursive: true });
  await mkdir(OUT_BRAND, { recursive: true });

  // Start from an empty manifest so a run that stops halfway never points at deleted files
  const manifest: Manifest = { generatedAt: new Date().toISOString(), photos: {}, brand: {} };
  await writeFile(MANIFEST, `${JSON.stringify({ ...manifest, generatedAt: null }, null, 2)}\n`);

  const jobs = [
    ...(await instagramPhotos()),
    ...photoSources.map((source, order) => ({
      file: path.join(SRC_DIR, source.file),
      meta: { id: source.id, origin: 'site' as const, alt: source.alt, tags: source.tags, order },
    })),
  ];

  console.log('\nProcessing photos…');
  for (const { file, meta } of jobs) {
    if (!existsSync(file)) continue;
    try {
      const entry = await processPhoto(file, meta);
      manifest.photos[entry.id] = entry;
      console.log(
        `  ${entry.id.padEnd(22)} ${String(entry.w).padStart(5)}×${String(entry.h).padEnd(5)} ${tier(entry.w)}`,
      );
    } catch (error) {
      problems.push(
        `${path.basename(file)}: could not be processed (${error instanceof Error ? error.message : error})`,
      );
    }
  }

  console.log('\nProcessing logo and badges…');
  for (const source of brandSources) {
    const file = path.join(SRC_DIR, source.file);
    if (!existsSync(file)) continue;
    try {
      const entry = await processBrand(file, source.id);
      manifest.brand[source.id] = entry;
      console.log(
        `  ${source.id.padEnd(22)} ${String(entry.w).padStart(5)}×${String(entry.h).padEnd(5)} ${entry.maskable ? 'transparent' : 'opaque'}`,
      );
      if (source.id === 'logo' && !entry.maskable) {
        problems.push('logo: no transparent background, so the typographic wordmark is used instead');
      }
    } catch (error) {
      problems.push(`${source.file}: could not be processed (${error instanceof Error ? error.message : error})`);
    }
  }

  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log('\nSlots');
  const resolved = resolveSlots(manifest);
  for (const name of Object.keys(slots) as (keyof typeof slots)[]) {
    const result = resolved[name];
    const detail =
      result.kind === 'photo'
        ? `${result.image.id} (${result.image.w}px wide)`
        : result.kind === 'artwork'
          ? 'no photo strong enough — section artwork'
          : 'placeholder (photo missing)';
    console.log(`  ${name.padEnd(10)} ${detail}`);
  }

  const count = Object.keys(manifest.photos).length;
  console.log(
    `\n${count} photo${count === 1 ? '' : 's'} and ${Object.keys(manifest.brand).length} brand images processed.`,
  );
  if (problems.length) {
    console.log(`\n${problems.length} problem${problems.length === 1 ? '' : 's'}:`);
    for (const problem of problems) console.log(`  - ${problem}`);
  }
}

main().catch((error) => {
  // Never break the site build over images; placeholders cover anything missing
  console.error('Image processing stopped:', error);
  process.exitCode = 0;
});
