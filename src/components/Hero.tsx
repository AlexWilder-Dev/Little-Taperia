import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { venue } from '../data/venue';
import { slotPhotos } from '../lib/images';
import { HoursBadge } from './ui/HoursBadge';
import { Icon } from './ui/Icon';
import { Photo } from './ui/Photo';
import { Reveal } from './ui/Reveal';
import './Hero.css';

export function Hero() {
  const frameRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: frameRef, offset: ['start start', 'end start'] });
  // The photo sits slightly taller than its frame and drifts down as the page scrolls
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '11%']);
  const slot = slotPhotos.hero;

  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      {slot.kind === 'photo' && (
        <div ref={frameRef} className="hero__frame">
          <motion.div className="hero__media" style={reduced ? undefined : { y }}>
            <Photo image={slot.image} sizes="(min-width: 85rem) 1360px, 100vw" priority className="hero__photo" />
          </motion.div>
        </div>
      )}

      <div className={`container hero__row ${slot.kind === 'photo' ? '' : 'hero__row--plain'}`}>
        <Reveal className="hero__intro">
          <h1 id="hero-title" className="hero__title display">
            <span className="visually-hidden">{venue.name}: </span>
            {venue.tagline}
          </h1>
          <p className="hero__where">
            {venue.address.street} · {venue.address.directionsNote}
          </p>
          <div className="hero__actions">
            <a href="#book" className="btn btn--primary">
              Book a table <Icon name="arrowRight" />
            </a>
            <a href="#menu" className="btn">
              See the menu
            </a>
          </div>
          <HoursBadge className="hero__badge" />
        </Reveal>
        <Reveal className="hero__welcome" delay={0.1}>
          <p>{venue.description}</p>
          <p className="hero__founders">
            Run by Tooting locals {venue.founders.map((founder) => founder.name).join(' and ')}.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
