import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { awards, extraBadges, mentions, quotes } from '../data/press';
import { brandUrl, getBrand } from '../lib/images';
import { softSpring } from '../lib/motion';
import { Icon } from './ui/Icon';
import { Reveal } from './ui/Reveal';
import './PressStrip.css';

const ROTATE_MS = 6500;

function Stars({ count }: { count: number }) {
  return (
    <span className="press__stars" role="img" aria-label={`${count} out of 5 stars`}>
      {'★'.repeat(count)}
      <span className="press__stars-off">{'★'.repeat(5 - count)}</span>
    </span>
  );
}

function AwardSeal({ award }: { award: (typeof awards)[number] }) {
  const badge = award.badge ? getBrand(award.badge) : undefined;
  if (badge) {
    return (
      <li className={`seal seal--image ${badge.maskable ? '' : 'seal--opaque'}`}>
        <img
          src={brandUrl(badge.file)}
          width={badge.w}
          height={badge.h}
          alt={`${award.org} ${award.title} ${award.year ?? ''}`.trim()}
          loading="lazy"
        />
      </li>
    );
  }
  return (
    <li className="seal">
      <span className="seal__org">{award.org}</span>
      <span className="seal__title display">{award.title}</span>
      {award.year && <span className="seal__year num">{award.year}</span>}
    </li>
  );
}

export function PressStrip() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const reduced = useReducedMotion();
  const autoplay = !reduced && !paused && !userPaused;

  useEffect(() => {
    if (!autoplay) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % quotes.length), ROTATE_MS);
    return () => window.clearTimeout(id);
  }, [autoplay, index]);

  const quote = quotes[index];
  const step = (delta: number) => setIndex((i) => (i + delta + quotes.length) % quotes.length);
  const extra = extraBadges.map((b) => ({ ...b, entry: getBrand(b.id) })).filter((b) => b.entry);

  return (
    <section id="press" className="press" aria-labelledby="press-title">
      <h2 id="press-title" className="visually-hidden">
        Reviews and awards
      </h2>
      <div className="container press__inner">
        <Reveal className="press__awards">
          <ul role="list" className="press__seals">
            {awards.map((award) => (
              <AwardSeal key={award.id} award={award} />
            ))}
            {extra.map((b) => (
              <li key={b.id} className={`seal seal--image ${b.entry!.maskable ? '' : 'seal--opaque'}`}>
                <img src={brandUrl(b.entry!.file)} width={b.entry!.w} height={b.entry!.h} alt={b.alt} loading="lazy" />
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal
          className="press__quotes"
          delay={0.1}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div className="press__stage" aria-live={autoplay ? 'off' : 'polite'}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.figure
                key={quote.id}
                className="press__quote"
                initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -14, filter: 'blur(6px)' }}
                transition={softSpring}
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
                  >
                    {i === index && autoplay && (
                      <motion.span
                        key={index}
                        className="press__dot-fill"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: ROTATE_MS / 1000, ease: 'linear' }}
                      />
                    )}
                  </button>
                </li>
              ))}
            </ol>
            <button type="button" className="icon-btn" onClick={() => step(1)} aria-label="Next review">
              <Icon name="arrowRight" />
            </button>
            {!reduced && (
              <button
                type="button"
                className="press__pause"
                onClick={() => setUserPaused((p) => !p)}
                aria-pressed={userPaused}
              >
                {userPaused ? 'Play' : 'Pause'}
              </button>
            )}
          </div>
        </Reveal>
      </div>

      <Reveal className="container press__mentions" delay={0.15}>
        <ul role="list">
          {mentions.map((mention) => (
            <li key={mention}>{mention}</li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
