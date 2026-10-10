import { brandSources } from '../data/photos';
import { awards, mentions, quotes } from '../data/press';
import { brandUrl, getBrand } from '../lib/images';
import { Reveal } from './ui/Reveal';
import './Press.css';

function Stars({ count }: { count: number }) {
  return (
    <span className="press__stars" role="img" aria-label={`${count} out of 5 stars`}>
      {'★'.repeat(count)}
    </span>
  );
}

const badges = brandSources.map((source) => ({ ...source, entry: getBrand(source.id) })).filter((badge) => badge.entry);

// Star ratings already appear with their quotes; this lists the awards and mentions
const honours = [
  ...awards.filter((award) => award.year).map((award) => `${award.org} ${award.title} ${award.year}`),
  ...mentions,
];

export function Press() {
  return (
    <section id="press" className="press band" aria-labelledby="press-title">
      <div className="container">
        <h2 id="press-title" className="press__title eyebrow">
          In the press
        </h2>
        <ul role="list" className="press__quotes">
          {quotes.map((quote, i) => (
            <Reveal as="li" key={quote.id} className="press__item" delay={0.06 * i}>
              <figure>
                <blockquote className="press__quote display">
                  <p>“{quote.quote}”</p>
                </blockquote>
                <figcaption className="press__cite">
                  <span className="press__source">{quote.source}</span>
                  {quote.stars && <Stars count={quote.stars} />}
                  {quote.context && <span className="press__context">{quote.context}</span>}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>

        <div className="press__honours">
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
            {honours.map((honour) => (
              <li key={honour}>{honour}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
