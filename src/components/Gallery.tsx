import { motion } from 'framer-motion';
import { useState, type CSSProperties } from 'react';
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

/** Placeholder frames cycle through these ratios so the masonry still has rhythm. */
const placeholderRatios = [4 / 5, 3 / 2, 1, 3 / 2, 4 / 5, 1, 16 / 10];

/** Every few photos get a portrait crop for rhythm, when they're tall enough to fill it sharply. */
const PORTRAIT = 4 / 5;
const PORTRAIT_EVERY = 5;
/** Widest a masonry column gets, in CSS pixels; a crop must not need upscaling to fill it. */
const COLUMN_PX = 420;

function ratioOf(item: GalleryItem, index: number): number {
  if (item.kind === 'placeholder') return placeholderRatios[index % placeholderRatios.length];
  const natural = item.image.w / item.image.h;
  const crop = index % PORTRAIT_EVERY === 1 && natural > 1 && item.image.h >= COLUMN_PX / PORTRAIT;
  return crop ? PORTRAIT : natural;
}

const items = galleryItems();
// A photo large enough to run across the full width leads the gallery
const leadIndex = items.findIndex((item) => item.kind === 'photo' && item.feature);
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
            const lead = index === leadIndex;
            const ratio = lead && item.kind === 'photo' ? item.image.w / item.image.h : ratioOf(item, index);
            return (
              <motion.li
                key={item.kind === 'photo' ? item.image.id : item.id}
                className={`tile ${lead ? 'tile--lead' : ''}`}
                style={{ '--ratio': ratio } as CSSProperties}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -8% 0px' }}
                transition={{ ...softSpring, delay: (index % 3) * 0.06 }}
              >
                {item.kind === 'photo' ? (
                  <button
                    type="button"
                    className="tile__button"
                    onClick={() => setOpen(photos.indexOf(item.image))}
                    aria-label={`Open photo: ${item.image.alt}`}
                  >
                    <Parallax amount={lead ? 6 : 4}>
                      <Photo
                        image={item.image}
                        sizes={lead ? '(min-width: 84rem) 80rem, 94vw' : '(min-width: 64rem) 420px, 50vw'}
                        className="tile__photo"
                        alt=""
                      />
                    </Parallax>
                    <span className="tile__caption">{item.image.alt}</span>
                  </button>
                ) : (
                  <PhotoPlaceholder label={item.alt} files={[item.file]} className="tile__placeholder" compact />
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
