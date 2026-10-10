import { venue } from '../data/venue';
import { groupedHours } from '../lib/hours';
import { Icon } from './ui/Icon';
import { Wordmark } from './ui/Wordmark';
import './Footer.css';

const socialIcon = { Instagram: 'instagram', Facebook: 'facebook' } as const;

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <Wordmark size="hero" />
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
