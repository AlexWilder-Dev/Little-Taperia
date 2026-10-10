/**
 * Photo sources and where they appear.
 *
 * `npm run images` downloads these into images-src/, converts them to
 * responsive AVIF/WebP in public/images/ and records their real dimensions in
 * src/data/image-manifest.json. Components read the manifest, so a photo only
 * shows once it has been processed; until then its slot shows a labelled
 * placeholder.
 *
 * Newer photos dropped into public/images/ig/ are processed too and preferred
 * over these 2015 site photos (see `tag:` candidates below and the gallery).
 * Tag them with an optional public/images/ig/captions.json:
 *   { "bar-at-night.jpg": { "alt": "The marble bar at night", "tags": ["interior", "bar"] } }
 *
 * Alt text and tags for files with camera-style names are generic until the
 * photos can be reviewed.
 */

export type PhotoTag = 'interior' | 'bar' | 'shopfront' | 'dish' | 'seafood' | 'drink' | 'people';

export interface PhotoSource {
  id: string;
  file: string;
  url: string;
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

export const brandSources: BrandSource[] = [
  {
    id: 'logo',
    file: 'taperia-logo1.png',
    url: `${SITE}/wp-content/uploads/2015/10/taperia-logo1.png`,
    alt: 'The Little Taperia',
  },
  {
    id: 'badge-love-london-2016',
    file: '156px_London-winner-2016.png',
    url: `${SITE}/images/156px_London-winner-2016.png`,
    alt: 'Time Out Love London Awards 2016 winner',
  },
  {
    id: 'badge-sticker-2017',
    file: 'Sticker-2017-115x150.png',
    url: `${SITE}/wp-content/uploads/2020/06/Sticker-2017-115x150.png`,
    alt: '2017 award sticker',
  },
];

export interface PhotoSlot {
  /** What the slot should show, used for placeholder labels. */
  label: string;
  /**
   * Photo ids in order of preference. `tag:<name>` matches any processed photo
   * with that tag, newer Instagram photos first.
   */
  candidates: string[];
  /** Smallest original width that still looks sharp at the slot's largest size. */
  minWidth: number;
  /** Minimum width ÷ height, for slots that need a landscape frame. */
  minAspect?: number;
}

export const slots = {
  hero: {
    label: 'Interior by candlelight',
    candidates: ['tag:interior', 'tag:bar', 'taperia-2015', 'entry'],
    minWidth: 1600,
    minAspect: 1.2,
  },
  shopfront: {
    label: 'The shopfront, once a pet shop',
    candidates: ['tag:shopfront', 'entry'],
    minWidth: 900,
  },
  rooms: {
    label: 'The front and back rooms',
    candidates: ['tag:bar', 'tag:interior', 'taperia-2015'],
    minWidth: 900,
  },
  seafood: {
    label: 'From the kitchen',
    candidates: ['tag:seafood', 'pulpo-a-feira', 'chipiron-relleno'],
    minWidth: 700,
  },
} satisfies Record<string, PhotoSlot>;

export type SlotName = keyof typeof slots;

/** Gallery size tiers, by original width. Photos below `min` are left out. */
export const galleryTiers = { feature: 1600, standard: 720, min: 480 };
