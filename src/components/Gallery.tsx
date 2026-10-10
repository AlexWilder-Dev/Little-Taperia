import { motion } from 'framer-motion';
import { useState } from 'react';
import { venue } from '../data/venue';
import { galleryItems, type GalleryItem } from '../lib/images';
import { softSpring } from '../lib/motion';
import { Icon } from './ui/Icon';
import { Parallax } from './ui/Parallax';
import { Photo } from './ui/Photo';
import { PhotoPlaceholder } from './ui/Placeholder';
import { SectionHeading } from './ui/SectionHeading';
import { Lightbox } from './Lightbox';
import './Gallery.css';

type Shape = 'feature' | 'landscape' | 'portrait' | 'square' | 'tall';

function shapeOf(item: GalleryItem, index: number): Shape {
  if (item.kind === 'placeholder') {
    const pattern: Shape[] = [
      'feature',
      'portrait',
      'square',
      'landscape',
      'portrait',
      'landscape',
      'tall',
      'square',
      'landscape',
    ];
    return pattern[index % pattern.length];
  }
  const ratio = item.image.w / item.image.h;
  if (item.feature) return ratio >= 1 ? 'feature' : 'tall';
  if (ratio >= 1.25) return 'landscape';
  if (ratio <= 0.85) return 'portrait';
  return 'square';
}

const sizesFor: Record<Shape, string> = {
  feature: '(min-width: 48rem) 66vw, 100vw',
  tall: '(min-width: 48rem) 33vw, 50vw',
  landscape: '(min-width: 48rem) 33vw, 100vw',
  portrait: '(min-width: 48rem) 25vw, 50vw',
  square: '(min-width: 48rem) 25vw, 50vw',
};

const items = galleryItems();
const photos = items.flatMap((item) => (item.kind === 'photo' ? [item.image] : []));

export function Gallery() {
  const [open, setOpen] = useState<number | null>(null);
  const instagram = venue.socials.find((s) => s.label === 'Instagram')!;

  return (
    <section id="gallery" className="section gallery" aria-labelledby="gallery-title">
      <div className="container">
        <div className="gallery__head">
          <SectionHeading
            id="gallery-title"
            number="05"
            eyebrow="Galería"
            title={
              <>
                Inside <em>the taperia</em>
              </>
            }
          />
          <a href={instagram.url} className="btn gallery__ig" target="_blank" rel="noopener noreferrer">
            <Icon name="instagram" /> {instagram.handle}
            <span className="visually-hidden">(opens Instagram in a new tab)</span>
          </a>
        </div>

        <ul role="list" className="gallery__grid">
          {items.map((item, index) => {
            const shape = shapeOf(item, index);
            return (
              <motion.li
                key={item.kind === 'photo' ? item.image.id : item.id}
                className={`tile tile--${shape}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -8% 0px' }}
                transition={{ ...softSpring, delay: (index % 4) * 0.06 }}
              >
                {item.kind === 'photo' ? (
                  <button
                    type="button"
                    className="tile__button"
                    onClick={() => setOpen(photos.indexOf(item.image))}
                    aria-label={`Open photo: ${item.image.alt}`}
                  >
                    <Parallax amount={5}>
                      <Photo image={item.image} sizes={sizesFor[shape]} className="tile__photo" alt="" />
                    </Parallax>
                    <span className="tile__caption">{item.image.alt}</span>
                  </button>
                ) : (
                  <PhotoPlaceholder
                    label={item.alt}
                    files={[item.file]}
                    className="tile__placeholder"
                    compact={shape !== 'feature'}
                  />
                )}
              </motion.li>
            );
          })}
        </ul>

        <p className="gallery__credit">{venue.photoCredit}</p>
      </div>

      <Lightbox photos={photos} index={open} onIndex={setOpen} />
    </section>
  );
}
