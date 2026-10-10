import rawManifest from '../data/image-manifest.json';
import { resolveGallery, resolveSlots, type BrandEntry, type ImageEntry, type Manifest } from './slots';

export type { BrandEntry, GalleryItem, ImageEntry, SlotResult } from './slots';

export const manifest = rawManifest as unknown as Manifest;

const base = import.meta.env.BASE_URL;

export const photoUrl = (id: string, w: number, format: 'avif' | 'webp') => `${base}images/photos/${id}-${w}.${format}`;

export const srcSet = (image: ImageEntry, format: 'avif' | 'webp') =>
  image.widths.map((w) => `${photoUrl(image.id, w, format)} ${w}w`).join(', ');

export const brandUrl = (file: string) => `${base}images/brand/${file}`;

export const getBrand = (id: string): BrandEntry | undefined => manifest.brand[id];

export const slotPhotos = resolveSlots(manifest);

export const galleryItems = () => resolveGallery(manifest);

/** The gallery section and its nav link only appear when there are photos to show. */
export const hasGallery = galleryItems().length > 0;
