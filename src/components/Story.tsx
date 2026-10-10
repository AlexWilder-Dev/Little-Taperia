import { venue } from '../data/venue';
import { slotPhotos } from '../lib/images';
import { Photo } from './ui/Photo';
import { Reveal } from './ui/Reveal';
import { SectionHeading } from './ui/SectionHeading';
import './Story.css';

export function Story() {
  const shopfront = slotPhotos.shopfront;
  const frontBar = slotPhotos.frontBar;

  return (
    <section id="story" className="section story" aria-labelledby="story-title">
      <div className="container">
        <SectionHeading
          id="story-title"
          eyebrow="Our story"
          title={
            <>
              From pet shop <em>to taperia</em>
            </>
          }
        />

        <article className={`story__row ${shopfront.kind === 'photo' ? 'story__row--photo' : ''}`}>
          <Reveal className="story__text">
            <h3 className="story__title display">It started life as a pet shop</h3>
            <div className="prose">
              <p>
                Before the sherry and the clink of small plates, {venue.address.street} — just past Tooting Broadway —
                was the local pet shop. Today its door opens onto something rather more glamorous.
              </p>
            </div>
          </Reveal>
          {shopfront.kind === 'photo' && (
            <Reveal className="story__media story__media--small" delay={0.08}>
              <figure>
                <Photo
                  image={shopfront.image}
                  sizes={`(min-width: 64rem) ${Math.min(shopfront.image.w, 520)}px, 90vw`}
                  className="frame"
                  noUpscale
                  style={{ aspectRatio: `${shopfront.image.w} / ${shopfront.image.h}` }}
                />
                <figcaption className="caption">{shopfront.image.alt}</figcaption>
              </figure>
            </Reveal>
          )}
        </article>

        <article className="story__founders">
          <Reveal className="story__text">
            <h3 className="story__title display">Two Tooting locals</h3>
            <div className="prose">
              <p>
                Hikmat Antippa and Madeleine Lim both call Tooting home. Their idea was simple: bring a little Iberian
                glamour to the High Street — inventive tapas, really good ingredients and surroundings worth lingering
                in.
              </p>
            </div>
          </Reveal>
          <ul role="list" className="founders">
            {venue.founders.map((founder, i) => (
              <Reveal as="li" key={founder.name} className="founder" delay={0.06 * i}>
                <p className="founder__role eyebrow">{founder.role}</p>
                <h4 className="founder__name display">{founder.name}</h4>
                <p className="founder__bio">{founder.bio}</p>
              </Reveal>
            ))}
          </ul>
        </article>

        <article className={`story__row story__row--rooms ${frontBar.kind === 'photo' ? 'story__row--photo' : ''}`}>
          {frontBar.kind === 'photo' && (
            <Reveal className="story__media">
              <figure>
                <Photo
                  image={frontBar.image}
                  sizes={`(min-width: 64rem) ${Math.min(frontBar.image.w, 720)}px, 100vw`}
                  className="frame"
                  noUpscale
                  style={{ aspectRatio: `${frontBar.image.w} / ${frontBar.image.h}` }}
                />
              </figure>
            </Reveal>
          )}
          <Reveal className="story__text" delay={0.08}>
            <h3 className="story__title display">Two rooms, two moods</h3>
            <div className="prose">
              <p>
                Come for a glass and a few bites, or settle in for the night. Both rooms are at their buzziest after
                8.30pm.
              </p>
            </div>
            <dl className="rooms">
              {venue.rooms.map((room) => (
                <div key={room.name} className="rooms__item">
                  <dt>
                    <span className="rooms__spanish display">{room.spanish}</span>
                    <span className="rooms__name">{room.name}</span>
                  </dt>
                  <dd>{room.description}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </article>
      </div>
    </section>
  );
}
