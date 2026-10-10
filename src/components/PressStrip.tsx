import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { brandSources } from '../data/photos';
import { awards, mentions, quotes } from '../data/press';
import { brandUrl, getBrand } from '../lib/images';
import { Icon } from './ui/Icon';
import { Reveal } from './ui/Reveal';
import './PressStrip.css';

const ROTATE_MS = 7000;

function Stars({ count }: { count: number }) {
  return (
    <span className="press__stars" role="img" aria-label={`${count} out of 5 stars`}>
      {'★'.repeat(count)}
    </span>
  );
}

const badges = brandSources.map((source) => ({ ...source, entry: getBrand(source.id) })).filter((badge) => badge.entry);

export function PressStrip() {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const autoplay = !reduced && !hovered && !paused;

  useEffect(() => {
    if (!autoplay) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % quotes.length), ROTATE_MS);
    return () => window.clearTimeout(id);
  }, [autoplay, index]);

  const quote = quotes[index];
  const step = (delta: number) => setIndex((i) => (i + delta + quotes.length) % quotes.length);

  return (
    <section id="press" className="press" aria-labelledby="press-title">
      <h2 id="press-title" className="visually-hidden">
        Reviews and awards
      </h2>
      <div className="container press__inner">
        <Reveal
          className="press__quotes"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setHovered(true)}
          onBlur={() => setHovered(false)}
        >
          <div className="press__stage" aria-live={autoplay ? 'off' : 'polite'}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.figure
                key={quote.id}
                className="press__quote"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
              >
                <blockquote className="display">
                  <p>“{quote.quote}”</p>
                </blockquote>
                <figcaption>
                  {quote.stars && <Stars count={quote.stars} />}
                  <span className="press__source">{quote.source}</span>
                  {quote.context && <span className="press__context">{quote.context}</span>}
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          <div className="press__controls">
            <button type="button" className="icon-btn" onClick={() => step(-1)} aria-label="Previous review">
              <Icon name="arrowLeft" />
            </button>
            <ol className="press__dots" role="list">
              {quotes.map((q, i) => (
                <li key={q.id}>
                  <button
                    type="button"
                    className={`press__dot ${i === index ? 'is-active' : ''}`}
                    aria-label={`Review ${i + 1} of ${quotes.length}: ${q.source}`}
                    aria-current={i === index ? 'true' : undefined}
                    onClick={() => setIndex(i)}
                  />
                </li>
              ))}
            </ol>
            <button type="button" className="icon-btn" onClick={() => step(1)} aria-label="Next review">
              <Icon name="arrowRight" />
            </button>
            {!reduced && (
              <button type="button" className="press__pause" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
                {paused ? 'Play' : 'Pause'}
              </button>
            )}
          </div>
        </Reveal>

        <Reveal className="press__awards" delay={0.1}>
          {badges.length > 0 && (
            <ul role="list" className="press__badges">
              {badges.map((badge) => (
                <li key={badge.id} className={badge.entry!.maskable ? '' : 'is-opaque'}>
                  <img
                    src={brandUrl(badge.entry!.file)}
                    width={badge.entry!.w}
                    height={badge.entry!.h}
                    alt={badge.alt}
                    loading="lazy"
                  />
                </li>
              ))}
            </ul>
          )}
          <ul role="list" className="press__list">
            {awards.map((award) => (
              <li key={award.id}>
                <strong>{award.org}</strong> {award.title}
                {award.year ? ` ${award.year}` : ''}
              </li>
            ))}
            {mentions.map((mention) => (
              <li key={mention}>{mention}</li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
