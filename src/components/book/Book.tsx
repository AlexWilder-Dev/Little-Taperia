import { venue } from '../../data/venue';
import { Icon } from '../ui/Icon';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';
import { BookingPanel } from './BookingPanel';
import { PrivateHire } from './PrivateHire';
import './Book.css';

export function Book() {
  return (
    <section id="book" className="section book" aria-labelledby="book-title">
      <div className="container">
        <SectionHeading
          id="book-title"
          number="06"
          eyebrow="Reservas"
          title={
            <>
              Book <em>a table</em>
            </>
          }
        >
          Inside tables are booked online and outdoor tables by email. Any party size is welcome.
        </SectionHeading>

        <div className="book__layout">
          <Reveal className="book__panel">
            <BookingPanel />
          </Reveal>

          <Reveal className="book__aside" delay={0.1}>
            <ul role="list" className="book__facts">
              <li>
                <Icon name="sun" />
                <div>
                  <h3>Outdoor tables</h3>
                  <p>
                    Booked by email only:{' '}
                    <a
                      href={`mailto:${venue.email}?subject=${encodeURIComponent('Outdoor table request')}`}
                      className="text-link"
                    >
                      {venue.email}
                    </a>
                  </p>
                </div>
              </li>
              <li>
                <Icon name="people" />
                <div>
                  <h3>Any party size</h3>
                  <p>From a quiet table for two to the whole gang. Private hire is available on certain days.</p>
                </div>
              </li>
              <li>
                <Icon name="phone" />
                <div>
                  <h3>Rather talk?</h3>
                  <p>
                    Call{' '}
                    <a href={`tel:${venue.phone.tel}`} className="text-link">
                      {venue.phone.display}
                    </a>
                  </p>
                </div>
              </li>
              <li>
                <Icon name="candle" />
                <div>
                  <h3>Good to know</h3>
                  <p>Last food orders are taken an hour before closing. {venue.serviceNote}</p>
                </div>
              </li>
            </ul>
          </Reveal>
        </div>

        <div id="private-hire" className="hire">
          <Reveal className="hire__intro">
            <p className="eyebrow">Private hire</p>
            <h3 className="hire__title display">
              The taperia, <em>all yours</em>
            </h3>
            <p className="prose">
              The Little Taperia is available for private hire on certain days. Send the date, your numbers and what you
              have in mind, and we’ll take it from there.
            </p>
          </Reveal>
          <Reveal className="hire__panel" delay={0.1}>
            <PrivateHire />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
