import { venue } from '../../data/venue';
import { Icon } from '../ui/Icon';
import { Reveal } from '../ui/Reveal';
import { BookingPanel } from './BookingPanel';
import { PrivateHire } from './PrivateHire';
import './Book.css';

export function Book() {
  return (
    <section id="book" className="section book band" aria-labelledby="book-title">
      <div className="container">
        <div className="book__layout">
          <Reveal className="book__intro">
            <p className="eyebrow">Reservas</p>
            <h2 id="book-title" className="book__title display">
              Book <em>a table</em>
            </h2>
            <p className="lede">
              Inside tables are booked online and outdoor tables by email. Any party size is welcome.
            </p>

            <ul role="list" className="book__facts">
              <li>
                <Icon name="sun" />
                <p>
                  <strong>Outdoor tables</strong> are booked by email only:{' '}
                  <a
                    href={`mailto:${venue.email}?subject=${encodeURIComponent('Outdoor table request')}`}
                    className="text-link"
                  >
                    {venue.email}
                  </a>
                </p>
              </li>
              <li>
                <Icon name="phone" />
                <p>
                  <strong>Rather talk?</strong> Call{' '}
                  <a href={`tel:${venue.phone.tel}`} className="text-link">
                    {venue.phone.display}
                  </a>
                </p>
              </li>
              <li>
                <Icon name="clock" />
                <p>
                  <strong>Good to know:</strong> last food orders are an hour before closing. {venue.serviceNote}
                </p>
              </li>
            </ul>
          </Reveal>

          <Reveal className="book__panel" delay={0.08}>
            <BookingPanel />
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
              have in mind, and the team will take it from there.
            </p>
          </Reveal>
          <Reveal className="hire__panel" delay={0.08}>
            <PrivateHire />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
