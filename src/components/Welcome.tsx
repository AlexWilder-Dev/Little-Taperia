import { venue } from '../data/venue';
import { formatClock, kitchenClose } from '../lib/hours';
import { slotPhotos } from '../lib/images';
import { Photo } from './ui/Photo';
import { Reveal } from './ui/Reveal';
import './Welcome.css';

const [front, back] = venue.rooms;

const kitchen = venue.hours.map((day, i) => ({ name: day.name, close: kitchenClose(i) }));
const usual = kitchen[0].close;
const later = kitchen.filter((day) => day.close !== usual);
const lastOrders = `Last food orders ${formatClock(usual)}${
  later.length ? `, or ${formatClock(later[0].close)} on ${later.map((day) => `${day.name}s`).join(' and ')}` : ''
}.`;

export function Welcome() {
  const photo = slotPhotos.frontBar;

  return (
    <section id="welcome" className="section welcome" aria-labelledby="welcome-title">
      <div className="container">
        <Reveal className="welcome__intro">
          <h2 id="welcome-title" className="eyebrow">
            Welcome to the taperia
          </h2>
          <p className="welcome__statement display">{venue.description}</p>
        </Reveal>

        <div className={`rooms ${photo.kind === 'photo' ? 'rooms--photo' : ''}`}>
          <Reveal className="room room--front">
            {photo.kind === 'photo' && (
              <Photo
                image={photo.image}
                sizes={`(min-width: 64rem) ${Math.min(photo.image.w, 760)}px, 100vw`}
                className="room__photo"
                noUpscale
                style={{ aspectRatio: `${photo.image.w} / ${photo.image.h}` }}
              />
            )}
            <div className="room__text">
              <p className="eyebrow">{front.name}</p>
              <h3 className="room__name display" lang="es">
                {front.spanish}
              </h3>
              <p className="room__desc">{front.description}</p>
            </div>
          </Reveal>

          <Reveal className="room room--back" delay={0.08}>
            <div className="room__text">
              <p className="eyebrow">{back.name}</p>
              <h3 className="room__name display" lang="es">
                {back.spanish}
              </h3>
              <p className="room__desc">{back.description}</p>
              <ul role="list" className="room__facts">
                <li>{lastOrders}</li>
                <li>Both rooms are at their buzziest after 8.30pm.</li>
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
