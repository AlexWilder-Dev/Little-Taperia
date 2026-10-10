import { venue } from '../data/venue';
import { formatClock, kitchenClose } from '../lib/hours';
import { useLondonNow } from '../lib/now';
import { HoursBadge } from './ui/HoursBadge';
import { Icon } from './ui/Icon';
import { Reveal } from './ui/Reveal';
import './Visit.css';

export function Visit() {
  const now = useLondonNow();

  return (
    <section id="visit" className="section visit" aria-labelledby="visit-title">
      <div className="container visit__inner">
        <div className="visit__layout">
          <Reveal className="visit__where">
            <h2 id="visit-title" className="eyebrow visit__title">
              Find us
            </h2>
            <address className="visit__address">
              <span className="visit__street display">{venue.address.street}</span>
              <span className="visit__city">
                {venue.address.locality} {venue.address.postcode}
              </span>
            </address>
            <p className="visit__note">
              <Icon name="pin" /> {venue.address.directionsNote} — a short walk from the Northern line station.
            </p>
            <div className="visit__actions">
              <a href={venue.mapsUrl} className="btn btn--primary" target="_blank" rel="noopener noreferrer">
                Get directions <Icon name="arrowUpRight" />
                <span className="visually-hidden">(opens Google Maps in a new tab)</span>
              </a>
              <a href={`tel:${venue.phone.tel}`} className="btn btn--light">
                <Icon name="phone" /> {venue.phone.display}
              </a>
              <a href={`mailto:${venue.email}`} className="btn btn--light visit__email">
                <Icon name="mail" /> {venue.email}
              </a>
            </div>
          </Reveal>

          <Reveal className="visit__hours" delay={0.1}>
            <div className="visit__hours-head">
              <h3 className="display">Opening hours</h3>
              <HoursBadge className="visit__badge" />
            </div>
            <table className="hours-table">
              <caption className="visually-hidden">Opening hours and last food orders, each day</caption>
              <thead>
                <tr>
                  <th scope="col">Day</th>
                  <th scope="col">Open</th>
                  <th scope="col">Kitchen</th>
                </tr>
              </thead>
              <tbody>
                {venue.hours.map((day, i) => {
                  const today = i === now.dayIndex;
                  return (
                    <tr
                      key={day.key}
                      className={today ? 'is-today' : undefined}
                      aria-current={today ? 'date' : undefined}
                    >
                      <th scope="row">
                        {day.name}
                        {today && <span className="hours-table__today">Today</span>}
                      </th>
                      <td className="num">
                        {formatClock(day.open)}–{formatClock(day.close)}
                      </td>
                      <td className="num">until {formatClock(kitchenClose(i))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="visit__fine">Last food orders one hour before close. Times are London time.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
