import { useState, type CSSProperties } from 'react';
import { venue } from '../data/venue';
import { galleryItems, hasGallery } from '../lib/images';
import { Icon } from './ui/Icon';
import { Photo } from './ui/Photo';
import { Reveal } from './ui/Reveal';
import { SectionHeading } from './ui/SectionHeading';
import { Lightbox } from './Lightbox';
import './Gallery.css';

const items = galleryItems();
const photos = items.map((item) => item.image);
// A photo large enough to run across the full width leads the gallery
const leadId = items.find((item) => item.feature)?.image.id;

export function Gallery() {
  const [open, setOpen] = useState<number | null>(null);
  const instagram = venue.socials.find((s) => s.label === 'Instagram')!;
  if (!hasGallery) return null;

  return (
    <section id="gallery" className="section gallery" aria-labelledby="gallery-title">
      <div className="container">
        <div className="gallery__head">
          <SectionHeading
            id="gallery-title"
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
          {items.map(({ image }, index) => (
            <Reveal
              as="li"
              key={image.id}
              className={`tile ${image.id === leadId ? 'tile--lead' : ''}`}
              style={{ '--ratio': image.w / image.h, '--max': `${image.w}px` } as CSSProperties}
              delay={(index % 3) * 0.05}
            >
              <button
                type="button"
                className="tile__button"
                onClick={() => setOpen(index)}
                aria-label={`Open photo: ${image.alt}`}
              >
                <Photo
                  image={image}
                  sizes={image.id === leadId ? '(min-width: 85rem) 80rem, 94vw' : '(min-width: 64rem) 420px, 50vw'}
                  className="tile__photo"
                  alt=""
                />
              </button>
            </Reveal>
          ))}
        </ul>

        <p className="gallery__credit">{venue.photoCredit}</p>
      </div>

      <Lightbox photos={photos} index={open} onIndex={setOpen} />
    </section>
  );
}
