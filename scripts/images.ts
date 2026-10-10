/**
 * Downloads the venue's photos and award badges, converts them to responsive
 * AVIF/WebP and writes src/data/image-manifest.json with their real
 * dimensions. Crops of the opening photo (src/data/photos.ts) are cut here too.
 *
 *   npm run images              download anything missing, then process
 *   npm run images -- --offline only process what is already in images-src/
 *   npm run images -- --refresh download everything again
 *   npm run images -- --strict  exit with an error if any download fails (CI)
 *
 * Photos are converted as they are: no grading or effects. A photo whose
 * original isn't available keeps its committed version.
 *
 * Newer photos placed in public/images/ig/ are processed too (see
 * src/data/photos.ts for the optional captions.json).
 */
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { brandSources, galleryTiers, photoCrops, photoSources, slots, type PhotoTag } from '../src/data/photos.ts';
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
const strict = args.has('--strict');

/** Output widths; each photo gets those below its own width, plus its own width. */
const WIDTHS = [480, 768, 1080, 1440, 1920, 2560];
const MAX_WIDTH = 2560;
const IMAGE_EXT = /\.(jpe?g|png|webp|avif|tiff?)$/i;

const failedDownloads: string[] = [];
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
        failedDownloads.push(`${source.file} (${reason})`);
        console.log(`  FAILED      ${source.file} — ${reason}`);
      }
    }
  };
  await Promise.all(Array.from({ length: 4 }, worker));
}

const hex = (n: number) => Math.round(n).toString(16).padStart(2, '0');

interface PhotoMeta {
  id: string;
  origin: ImageEntry['origin'];
  alt: string;
  tags: string[];
  order: number;
}

/** Decodes a photo once: oriented, flattened and in sRGB. */
async function decode(file: string) {
  const { data, info } = await sharp(file, { failOn: 'none' })
    .rotate()
    .flatten({ background: '#ffffff' })
    .toColourspace('srgb')
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height, channels: info.channels as 3 };
}

type Decoded = Awaited<ReturnType<typeof decode>>;

async function removeOutputs(id: string) {
  if (!existsSync(OUT_PHOTOS)) return;
  const pattern = new RegExp(`^${id}-\\d+\\.(avif|webp)$`);
  for (const file of await readdir(OUT_PHOTOS)) if (pattern.test(file)) await rm(path.join(OUT_PHOTOS, file));
}

async function encode(source: Decoded, meta: PhotoMeta): Promise<ImageEntry> {
  const raw = { raw: { width: source.width, height: source.height, channels: source.channels } } as const;
  const top = Math.min(source.width, MAX_WIDTH);
  const widths = [...WIDTHS.filter((w) => w < top), top];

  await removeOutputs(meta.id);
  for (const width of widths) {
    const resized = sharp(source.data, raw).resize({ width, withoutEnlargement: true });
    await resized
      .clone()
      .avif({ quality: 55, effort: 4 })
      .toFile(path.join(OUT_PHOTOS, `${meta.id}-${width}.avif`));
    await resized
      .clone()
      .webp({ quality: 78 })
      .toFile(path.join(OUT_PHOTOS, `${meta.id}-${width}.webp`));
  }

  const lqip = await sharp(source.data, raw).resize({ width: 24 }).blur(1.2).webp({ quality: 40 }).toBuffer();
  const { dominant } = await sharp(source.data, raw).stats();

  return {
    id: meta.id,
    origin: meta.origin,
    w: source.width,
    h: source.height,
    widths,
    lqip: `data:image/webp;base64,${lqip.toString('base64')}`,
    color: `#${hex(dominant.r)}${hex(dominant.g)}${hex(dominant.b)}`,
    alt: meta.alt,
    tags: meta.tags,
    order: meta.order,
  };
}

async function cut(source: Decoded, [fx, fy, fw, fh]: [number, number, number, number]): Promise<Decoded> {
  const raw = { raw: { width: source.width, height: source.height, channels: source.channels } } as const;
  const left = Math.round(fx * source.width);
  const top = Math.round(fy * source.height);
  const width = Math.min(source.width - left, Math.round(fw * source.width));
  const height = Math.min(source.height - top, Math.round(fh * source.height));
  const { data, info } = await sharp(source.data, raw)
    .extract({ left, top, width, height })
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height, channels: info.channels as 3 };
}

async function processBrand(file: string, id: string): Promise<BrandEntry> {
  const metadata = await sharp(file).metadata();
  const stats = await sharp(file).stats();
  const alpha = metadata.hasAlpha ? stats.channels[3] : undefined;
  // Transparent badges sit straight on the page; opaque ones get a frame
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

const log = (entry: { id: string; w: number; h: number }, note: string) =>
  console.log(`  ${entry.id.padEnd(22)} ${String(entry.w).padStart(5)}×${String(entry.h).padEnd(5)} ${note}`);

async function readManifest(): Promise<Manifest> {
  try {
    return JSON.parse(await readFile(MANIFEST, 'utf8')) as Manifest;
  } catch {
    return { generatedAt: null, photos: {}, brand: {} };
  }
}

async function main() {
  console.log(offline ? 'Processing images (offline)…' : 'Fetching images…');
  await fetchAll();
  await mkdir(OUT_PHOTOS, { recursive: true });
  await mkdir(OUT_BRAND, { recursive: true });

  const previous = await readManifest();
  const manifest: Manifest = { generatedAt: new Date().toISOString(), photos: {}, brand: {} };
  const decoded = new Map<string, Decoded>();

  const jobs = [
    ...(await instagramPhotos()),
    ...photoSources.map((source, order) => ({
      file: path.join(SRC_DIR, source.file),
      meta: { id: source.id, origin: 'site' as const, alt: source.alt, tags: source.tags, order },
    })),
  ];

  console.log('\nPhotos');
  for (const { file, meta } of jobs) {
    if (existsSync(file)) {
      try {
        const source = await decode(file);
        if (photoCrops.some((crop) => crop.from === meta.id)) decoded.set(meta.id, source);
        const entry = await encode(source, meta);
        manifest.photos[entry.id] = entry;
        log(entry, tier(entry.w));
        continue;
      } catch (error) {
        problems.push(
          `${path.basename(file)}: could not be processed (${error instanceof Error ? error.message : error})`,
        );
      }
    }
    const kept = previous.photos[meta.id];
    if (kept) {
      manifest.photos[meta.id] = { ...kept, alt: meta.alt, tags: meta.tags, order: meta.order };
      log(kept, 'kept the committed version (original not available)');
    }
  }

  console.log('\nCrops of the opening photo');
  for (const [order, crop] of photoCrops.entries()) {
    const source = decoded.get(crop.from);
    const meta = { id: crop.id, origin: 'site' as const, alt: crop.alt, tags: crop.tags, order: 1000 + order };
    if (source) {
      const entry = await encode(await cut(source, crop.box), meta);
      manifest.photos[entry.id] = entry;
      log(entry, `from ${crop.from}`);
    } else if (previous.photos[crop.id]) {
      manifest.photos[crop.id] = { ...previous.photos[crop.id], alt: crop.alt, tags: crop.tags };
      log(previous.photos[crop.id], 'kept the committed version');
    }
  }

  console.log('\nBadges');
  for (const source of brandSources) {
    const file = path.join(SRC_DIR, source.file);
    if (existsSync(file)) {
      try {
        const entry = await processBrand(file, source.id);
        manifest.brand[source.id] = entry;
        console.log(`  ${source.id.padEnd(22)} ${String(entry.w).padStart(5)}×${String(entry.h).padEnd(5)}`);
        continue;
      } catch (error) {
        problems.push(`${source.file}: could not be processed (${error instanceof Error ? error.message : error})`);
      }
    }
    if (previous.brand[source.id]) manifest.brand[source.id] = previous.brand[source.id];
  }

  // Remove outputs nothing refers to any more
  const keep = new Set<string>();
  for (const entry of Object.values(manifest.photos))
    for (const w of entry.widths) for (const ext of ['avif', 'webp']) keep.add(`${entry.id}-${w}.${ext}`);
  for (const file of await readdir(OUT_PHOTOS)) if (!keep.has(file)) await rm(path.join(OUT_PHOTOS, file));
  const keepBrand = new Set(Object.values(manifest.brand).flatMap((b) => [b.file, b.webp ?? '']));
  for (const file of await readdir(OUT_BRAND)) if (!keepBrand.has(file)) await rm(path.join(OUT_BRAND, file));

  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log('\nSlots');
  const resolved = resolveSlots(manifest);
  for (const name of Object.keys(slots) as (keyof typeof slots)[]) {
    const result = resolved[name];
    console.log(
      `  ${name.padEnd(10)} ${result.kind === 'photo' ? `${result.image.id} (${result.image.w}px wide)` : '—'}`,
    );
  }

  const count = Object.keys(manifest.photos).length;
  console.log(
    `\n${count} photo${count === 1 ? '' : 's'} and ${Object.keys(manifest.brand).length} badges in the manifest.`,
  );
  if (failedDownloads.length) {
    console.log(`\n${failedDownloads.length} download${failedDownloads.length === 1 ? '' : 's'} failed:`);
    for (const failure of failedDownloads) console.log(`  - ${failure}`);
  }
  if (problems.length) {
    console.log(`\n${problems.length} problem${problems.length === 1 ? '' : 's'}:`);
    for (const problem of problems) console.log(`  - ${problem}`);
  }
  if (strict && (failedDownloads.length || problems.length)) {
    console.error('\nStopping: --strict needs every photo.');
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('Image processing stopped:', error);
  process.exitCode = 1;
});
