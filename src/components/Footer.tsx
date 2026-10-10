import type { CSSProperties } from 'react';
import { venue } from '../data/venue';
import { groupedHours } from '../lib/hours';
import { photoUrl, slotPhotos } from '../lib/images';
import { Icon } from './ui/Icon';
import { Wordmark } from './ui/Wordmark';
import './Footer.css';

const socialIcon = { Instagram: 'instagram', Facebook: 'facebook' } as const;

export function Footer() {
  const timber = slotPhotos.timber;
  return (
    <footer className="footer">
      {timber.kind === 'photo' && (
        // A strip of the bar's own reclaimed timber front, shown at its real size
        <div
          className="footer__timber"
          aria-hidden="true"
          style={
            {
              // Set inline so the relative URLs resolve against the page, not the stylesheet
              backgroundImage: `image-set(url(${photoUrl(timber.image.id, timber.image.w, 'avif')}) type('image/avif'), url(${photoUrl(timber.image.id, timber.image.w, 'webp')}) type('image/webp'))`,
              '--timber-w': `${timber.image.w}px`,
              '--timber-h': `${timber.image.h}px`,
            } as CSSProperties
          }
        />
      )}
      <div className="container">
        <div className="footer__top">
          <Wordmark size="large" />
          <a href="#book" className="btn btn--primary">
            Book a table <Icon name="arrowRight" />
          </a>
        </div>

        <div className="footer__cols">
          <div>
            <h2 className="footer__heading">Visit</h2>
            <address>
              {venue.address.street}
              <br />
              {venue.address.locality} {venue.address.postcode}
            </address>
          </div>
          <div>
            <h2 className="footer__heading">Contact</h2>
            <p>
              <a href={`tel:${venue.phone.tel}`}>{venue.phone.display}</a>
            </p>
            <p>
              <a href={`mailto:${venue.email}`}>{venue.email}</a>
            </p>
          </div>
          <div>
            <h2 className="footer__heading">Hours</h2>
            <dl className="footer__hours num">
              {groupedHours().map((range) => (
                <div key={range.days}>
                  <dt>{range.days}</dt>
                  <dd>{range.hours}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h2 className="footer__heading">Follow</h2>
            <ul role="list" className="footer__social">
              {venue.socials.map((social) => (
                <li key={social.label}>
                  <a href={social.url} target="_blank" rel="noopener noreferrer">
                    <Icon name={socialIcon[social.label as keyof typeof socialIcon]} />
                    {social.label}
                    <span className="visually-hidden">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer__small">
          <p>{venue.serviceNote}</p>
          <p>{venue.allergenNotice}</p>
          <p>{venue.photoCredit}</p>
          <p className="footer__concept">
            A design concept, not the official website of The Little Taperia — the booking and enquiry forms here are
            previews and don’t send anything. Visit{' '}
            <a href={venue.website} target="_blank" rel="noopener noreferrer">
              thelittletaperia.co.uk
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
