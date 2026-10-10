/**
 * Decides which processed photo fills each slot and what the gallery shows.
 * Pure functions over the manifest, shared by the site and `npm run images`.
 */
import { galleryExclude, galleryTiers, slots, type PhotoSlot, type SlotName } from '../data/photos.ts';

export interface ImageEntry {
  id: string;
  origin: 'site' | 'ig';
  /** Original dimensions, after orientation. */
  w: number;
  h: number;
  /** Generated widths, never larger than the original. */
  widths: number[];
  /** Tiny blurred preview as a data URI. */
  lqip: string;
  /** Dominant colour, used behind the image while it loads. */
  color: string;
  alt: string;
  tags: string[];
  order: number;
}

export interface BrandEntry {
  file: string;
  webp?: string;
  w: number;
  h: number;
  /** True when the image has real transparency, so it can be recoloured with a CSS mask. */
  maskable?: boolean;
}

export interface Manifest {
  generatedAt: string | null;
  photos: Record<string, ImageEntry>;
  brand: Record<string, BrandEntry>;
}

export type SlotResult = { kind: 'photo'; image: ImageEntry } | { kind: 'none' };

export type GalleryItem = { image: ImageEntry; feature: boolean };

/** Newer Instagram photos first, then the site photos in their listed order. */
export function sortedPhotos(manifest: Manifest): ImageEntry[] {
  return Object.values(manifest.photos).sort((a, b) =>
    a.origin === b.origin ? a.order - b.order : a.origin === 'ig' ? -1 : 1,
  );
}

export const fitsSlot = (image: ImageEntry, slot: PhotoSlot) =>
  image.w >= slot.minWidth && (slot.minAspect === undefined || image.w / image.h >= slot.minAspect);

function candidatesFor(slot: PhotoSlot, manifest: Manifest, sorted: ImageEntry[]): ImageEntry[] {
  return slot.candidates.flatMap((candidate) => {
    if (candidate.startsWith('tag:')) {
      const tag = candidate.slice(4);
      return sorted.filter((image) => image.tags.includes(tag));
    }
    const image = manifest.photos[candidate];
    return image ? [image] : [];
  });
}

/** Fills slots in order, never using the same photo twice. A slot with nothing suitable stays empty. */
export function resolveSlots(manifest: Manifest): Record<SlotName, SlotResult> {
  const sorted = sortedPhotos(manifest);
  const used = new Set<string>();
  const result = {} as Record<SlotName, SlotResult>;
  for (const name of Object.keys(slots) as SlotName[]) {
    const slot: PhotoSlot = slots[name];
    const pick = candidatesFor(slot, manifest, sorted).find((image) => !used.has(image.id) && fitsSlot(image, slot));
    if (pick) used.add(pick.id);
    result[name] = pick ? { kind: 'photo', image: pick } : { kind: 'none' };
  }
  return result;
}

/** Every processed photo big enough to show, except the opening photo and its crops. */
export function resolveGallery(manifest: Manifest): GalleryItem[] {
  return sortedPhotos(manifest)
    .filter((image) => !galleryExclude.includes(image.id) && image.w >= galleryTiers.min)
    .map((image) => ({ image, feature: image.w >= galleryTiers.feature }));
}
