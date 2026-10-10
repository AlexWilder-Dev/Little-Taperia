import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { venue } from '../data/venue';
import { slotPhotos } from '../lib/images';
import { softSpring } from '../lib/motion';
import { CandleLight } from './effects/CandleLight';
import { HeroArtwork } from './effects/HeroArtwork';
import { HoursBadge } from './ui/HoursBadge';
import { Icon } from './ui/Icon';
import { Magnetic } from './ui/Magnetic';
import { Photo } from './ui/Photo';
import { PhotoPlaceholder } from './ui/Placeholder';
import { Wordmark } from './ui/Wordmark';
import './Hero.css';

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { ...softSpring, delay },
});

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const mediaY = useTransform(scrollYProgress, [0, 1], ['0%', '22%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const reduced = useReducedMotion();
  const slot = slotPhotos.hero;
  const hasPhoto = slot.kind === 'photo';

  return (
    <section ref={ref} id="top" className={`hero ${hasPhoto ? 'hero--photo' : 'hero--art'}`}>
      <motion.div className="hero__media" style={reduced ? undefined : { y: mediaY }}>
        {slot.kind === 'photo' && <Photo image={slot.image} sizes="100vw" priority className="hero__photo" />}
        {slot.kind === 'artwork' && <HeroArtwork />}
        {slot.kind === 'missing' && (
          <PhotoPlaceholder label={slot.label} files={slot.files} className="hero__placeholder">
            <HeroArtwork />
          </PhotoPlaceholder>
        )}
        <CandleLight className="hero__lights" density={hasPhoto ? 0.55 : 1} intensity={hasPhoto ? 0.7 : 1} />
        <div className="hero__shade" />
      </motion.div>

      <motion.div
        className="hero__content container"
        style={reduced ? undefined : { y: contentY, opacity: contentOpacity }}
      >
        <motion.p className="eyebrow hero__eyebrow" {...rise(0.15)}>
          {venue.address.street} · SW17
        </motion.p>
        <motion.div {...rise(0.3)}>
          <Wordmark size="hero" as="h1" />
        </motion.div>
        <motion.p className="hero__tagline" {...rise(0.5)}>
          {venue.tagline}
        </motion.p>
        <motion.div className="hero__actions" {...rise(0.65)}>
          <Magnetic>
            <a href="#book" className="btn btn--primary">
              Book a table <Icon name="arrowRight" />
            </a>
          </Magnetic>
          <Magnetic>
            <a href="#menu" className="btn">
              See the menu
            </a>
          </Magnetic>
        </motion.div>
        <motion.div {...rise(0.8)}>
          <HoursBadge />
        </motion.div>
      </motion.div>

      <a href="#press" className="hero__scroll" aria-label="Scroll to reviews">
        <span className="hero__scroll-line" aria-hidden="true" />
      </a>
    </section>
  );
}
