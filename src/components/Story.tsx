import { venue } from '../data/venue';
import { slotPhotos } from '../lib/images';
import { Photo } from './ui/Photo';
import { Reveal } from './ui/Reveal';
import './Story.css';

export function Story() {
  const shopfront = slotPhotos.shopfront;

  return (
    <section id="story" className="section story" aria-labelledby="story-title">
      <div className="container story__grid">
        <Reveal className="story__head">
          <p className="eyebrow">Our story</p>
          <h2 id="story-title" className="story__title display">
            From pet shop <em>to&nbsp;taperia</em>
          </h2>
        </Reveal>

        <div className="story__body">
          <Reveal className={`story__chapter ${shopfront.kind === 'photo' ? 'story__chapter--photo' : ''}`}>
            <p className="story__lead display">
              Before the sherry and the clink of small plates, {venue.address.street} was the local pet shop.
            </p>
            {shopfront.kind === 'photo' && (
              <figure className="story__photo">
                <Photo
                  image={shopfront.image}
                  sizes={`(min-width: 64rem) ${Math.min(shopfront.image.w, 420)}px, 90vw`}
                  noUpscale
                  style={{ aspectRatio: `${shopfront.image.w} / ${shopfront.image.h}` }}
                />
                <figcaption className="caption">{shopfront.image.alt}</figcaption>
              </figure>
            )}
            <div className="prose">
              <p>
                Hikmat Antippa and Madeleine Lim both call Tooting home. Their idea was simple: bring a little Iberian
                glamour to the High Street, with inventive tapas, really good ingredients and surroundings worth
                lingering in.
              </p>
            </div>
          </Reveal>

          <ul role="list" className="founders">
            {venue.founders.map((founder, i) => (
              <Reveal as="li" key={founder.name} className="founder" delay={0.06 * i}>
                <p className="eyebrow">{founder.role}</p>
                <h3 className="founder__name display">{founder.name}</h3>
                <p className="founder__bio">{founder.bio}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
