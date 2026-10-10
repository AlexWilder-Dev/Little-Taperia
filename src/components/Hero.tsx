import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { venue } from '../data/venue';
import { slotPhotos } from '../lib/images';
import { HoursBadge } from './ui/HoursBadge';
import { Icon } from './ui/Icon';
import { Photo } from './ui/Photo';
import './Hero.css';

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  // The photo sits slightly taller than its frame and drifts down as the page scrolls
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);
  const slot = slotPhotos.hero;

  return (
    <section
      ref={ref}
      id="top"
      className={`hero ${slot.kind === 'photo' ? 'hero--photo' : ''}`}
      aria-labelledby="hero-title"
    >
      <div className="hero__text">
        <HoursBadge className="hero__status" />
        <h1 id="hero-title" className="hero__title display">
          <span className="visually-hidden">{venue.name}: </span>
          Spanish tapas, <em>sherry &amp; cocktails</em> on Tooting High&nbsp;Street
        </h1>
        <p className="hero__lede">
          Two rooms just past Tooting Broadway: a marble-topped bar at the front for a glass and a few bites, and an
          open kitchen at the back for a proper meal.
        </p>
        <div className="hero__actions">
          <a href="#book" className="btn btn--primary">
            Book a table <Icon name="arrowRight" />
          </a>
          <a href="#menu" className="btn">
            See the menu
          </a>
        </div>
      </div>

      {slot.kind === 'photo' && (
        <figure className="hero__media">
          <motion.div className="hero__layer" style={reduced ? undefined : { y }}>
            <Photo image={slot.image} sizes="(min-width: 64rem) 58vw, 100vw" priority className="hero__photo" />
          </motion.div>
          <figcaption className="hero__caption">The front-room bar</figcaption>
        </figure>
      )}
    </section>
  );
}
