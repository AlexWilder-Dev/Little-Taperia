/**
 * Photo sources and where they appear.
 *
 * `npm run images` downloads these into images-src/, converts them to
 * responsive AVIF/WebP in public/images/ and records their real dimensions in
 * src/data/image-manifest.json. Components read the manifest: a section shows
 * a photo once it has been processed, and simply goes without one otherwise.
 *
 * Newer photos dropped into public/images/ig/ are processed too and preferred
 * over the 2015 site photos (see `tag:` candidates below and the gallery).
 * Tag them with an optional public/images/ig/captions.json:
 *   { "bar-at-night.jpg": { "alt": "The marble bar at night", "tags": ["interior", "bar"] } }
 *
 * Alt text for files with camera-style names stays generic until someone has
 * looked at the photos.
 */

export type PhotoTag = 'interior' | 'bar' | 'shopfront' | 'dish' | 'seafood' | 'drink' | 'people';

export interface PhotoSource {
  id: string;
  file: string;
  url: string;
  alt: string;
  tags: PhotoTag[];
}

/** A crop of another photo, cut by the image script. Box is [x, y, width, height] as fractions. */
export interface PhotoCrop {
  id: string;
  from: string;
  box: [number, number, number, number];
  alt: string;
  tags: PhotoTag[];
}

export interface BrandSource {
  id: string;
  file: string;
  url: string;
  alt: string;
}

const SITE = 'https://www.thelittletaperia.co.uk';
const GALLERY = `${SITE}/wp-content/gallery/taperia-gallery/`;

const generic = 'Inside The Little Taperia';

const gallery = (id: string, file: string, alt = generic, tags: PhotoTag[] = []): PhotoSource => ({
  id,
  file,
  url: GALLERY + file,
  alt,
  tags,
});

export const photoSources: PhotoSource[] = [
  {
    id: 'hero',
    file: 'IMG_0003par.jpg',
    url: `${SITE}/wp-content/uploads/2020/06/IMG_0003par.jpg`,
    alt: 'The front-room bar: a white marble bar top on reclaimed timber, shelves of wine and spirits under copper pendant lamps, and longhorn horns above a sage-green shuttered mirror',
    tags: ['interior', 'bar'],
  },
  gallery('entry', 'taperia-entry.jpg', 'The entrance to The Little Taperia on Tooting High Street', ['shopfront']),
  gallery('taperia-2015', 'The-Little-Taperia-2015-1-WEB.jpg', 'The Little Taperia', ['interior']),
  gallery('pulpo-a-feira', 'taperia-pulpofeira.jpg', 'Pulpo a feira — Galician-style octopus', ['dish', 'seafood']),
  gallery('chipiron-relleno', 'taperia-chipironrelleno.jpg', 'Chipirón relleno — stuffed baby squid', [
    'dish',
    'seafood',
  ]),
  gallery('img-0002', 'IMG_0002.jpg'),
  gallery('img-0003', 'IMG_0003.jpg'),
  gallery('img-0004', 'IMG_0004.jpg'),
  gallery('img-0006', 'IMG_0006.jpg'),
  gallery('img-0007', 'IMG_0007.jpg'),
  gallery('img-0009', 'IMG_0009.jpg'),
  gallery('img-0010', 'IMG_0010.jpg'),
  gallery('img-0013', 'IMG_0013.jpg'),
  gallery('img-0014', 'IMG_0014.jpg'),
  gallery('image2a', 'image2a.jpg'),
  gallery('image6a', 'image6a.jpg'),
  gallery('image7a', 'image7a.jpg'),
  gallery('cqpydzbw', 'CQPyDZBWsAESK3F.jpg'),
  gallery('cqp5pyhw', 'CQP5PyhWcAA5hS7.jpg'),
];

/** Details of the opening photo, used where a section wants a closer look at one material. */
export const photoCrops: PhotoCrop[] = [
  {
    id: 'crop-front-bar',
    from: 'hero',
    box: [0, 0.555, 0.53, 0.445],
    alt: 'The front of the bar: marble top, reclaimed timber planks with brass hooks and bentwood stools',
    tags: ['bar'],
  },
  {
    id: 'crop-shelf',
    from: 'hero',
    box: [0.585, 0, 0.24, 0.66],
    alt: 'Shelves of gin, wine and glasses behind the bar, under cut-glass pendant lamps',
    tags: ['bar', 'drink'],
  },
];

export const brandSources: BrandSource[] = [
  {
    id: 'badge-love-london-2016',
    file: '156px_London-winner-2016.png',
    url: `${SITE}/images/156px_London-winner-2016.png`,
    alt: 'Time Out Love London Awards 2016 winner',
  },
  {
    id: 'badge-hardens-2017',
    file: 'Sticker-2017-115x150.png',
    url: `${SITE}/wp-content/uploads/2020/06/Sticker-2017-115x150.png`,
    alt: 'Listed in Harden’s 2017',
  },
];

export interface PhotoSlot {
  /**
   * Photo ids in order of preference. `tag:<name>` matches any processed photo
   * with that tag, newer Instagram photos first.
   */
  candidates: string[];
  /** Smallest original width worth showing here. Photos are never shown larger than their pixels. */
  minWidth: number;
  /** Minimum width ÷ height, for slots that need a landscape frame. */
  minAspect?: number;
}

export const slots = {
  hero: { candidates: ['hero'], minWidth: 1200, minAspect: 1.4 },
  shopfront: { candidates: ['tag:shopfront', 'entry'], minWidth: 600 },
  frontBar: { candidates: ['crop-front-bar'], minWidth: 500 },
  shelf: { candidates: ['crop-shelf'], minWidth: 300 },
  seafood: { candidates: ['tag:seafood', 'pulpo-a-feira', 'chipiron-relleno'], minWidth: 600 },
} satisfies Record<string, PhotoSlot>;

export type SlotName = keyof typeof slots;

/** The opening photo and its crops appear in their own sections, not the gallery. */
export const galleryExclude = ['hero', ...photoCrops.map((crop) => crop.id)];

/** Gallery size tiers, by original width. Photos below `min` are left out. */
export const galleryTiers = { feature: 1600, standard: 720, min: 480 };
