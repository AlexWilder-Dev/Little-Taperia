import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { venue } from '../data/venue';
import { galleryItems, hasGallery } from '../lib/images';
import { Icon } from './ui/Icon';
import { Photo } from './ui/Photo';
import { Reveal } from './ui/Reveal';
import { Lightbox } from './Lightbox';
import './Gallery.css';

const photos = galleryItems().map((item) => item.image);

/** A strip of photos that scrolls sideways, each shown no larger than its own pixels. */
export function Gallery() {
  const [open, setOpen] = useState<number | null>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const stripRef = useRef<HTMLUListElement>(null);
  const instagram = venue.socials.find((s) => s.label === 'Instagram')!;

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const update = () =>
      setEdges({
        start: strip.scrollLeft <= 4,
        end: strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 4,
      });
    update();
    strip.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      strip.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const step = (direction: 1 | -1) => {
    const strip = stripRef.current;
    if (!strip) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    strip.scrollBy({ left: direction * strip.clientWidth * 0.8, behavior: reduced ? 'auto' : 'smooth' });
  };

  if (!hasGallery) return null;

  return (
    <section id="gallery" className="section gallery" aria-labelledby="gallery-title">
      <div className="container gallery__head">
        <Reveal className="gallery__intro">
          <p className="eyebrow">Galería</p>
          <h2 id="gallery-title" className="gallery__title display">
            Inside <em>the taperia</em>
          </h2>
        </Reveal>
        <div className="gallery__controls">
          <a href={instagram.url} className="text-link gallery__ig" target="_blank" rel="noopener noreferrer">
            <Icon name="instagram" /> {instagram.handle}
            <span className="visually-hidden">(opens Instagram in a new tab)</span>
          </a>
          <button type="button" className="icon-btn" onClick={() => step(-1)} disabled={edges.start}>
            <Icon name="arrowLeft" />
            <span className="visually-hidden">Scroll photos back</span>
          </button>
          <button type="button" className="icon-btn" onClick={() => step(1)} disabled={edges.end}>
            <Icon name="arrowRight" />
            <span className="visually-hidden">Scroll photos forward</span>
          </button>
        </div>
      </div>

      <ul ref={stripRef} role="list" className="gallery__strip" aria-label="Photos of The Little Taperia">
        {photos.map((image, index) => (
          <li
            key={image.id}
            className="gallery__item"
            style={{ '--ratio': image.w / image.h, '--native-h': `${image.h}px` } as CSSProperties}
          >
            <button
              type="button"
              className="gallery__button"
              onClick={() => setOpen(index)}
              aria-label={`Open photo ${index + 1} of ${photos.length}: ${image.alt}`}
            >
              <Photo image={image} sizes="(min-width: 64rem) 640px, 80vw" className="gallery__photo" alt="" />
            </button>
          </li>
        ))}
      </ul>

      <p className="container gallery__credit">{venue.photoCredit}</p>

      <Lightbox photos={photos} index={open} onIndex={setOpen} />
    </section>
  );
}
