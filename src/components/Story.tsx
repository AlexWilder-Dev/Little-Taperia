import { AnimatePresence, motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { venue } from '../data/venue';
import { slotPhotos, type SlotResult } from '../lib/images';
import { softSpring } from '../lib/motion';
import { FoundersArt, RoomsArt, ShopfrontArt } from './effects/StoryArt';
import { Parallax } from './ui/Parallax';
import { Photo } from './ui/Photo';
import { PhotoPlaceholder } from './ui/Placeholder';
import { Reveal } from './ui/Reveal';
import { SectionHeading } from './ui/SectionHeading';
import './Story.css';

function SlotVisual({ slot, art, sizes }: { slot: SlotResult; art: ReactNode; sizes: string }) {
  if (slot.kind === 'photo') {
    return (
      <Parallax>
        <Photo image={slot.image} sizes={sizes} className="story-visual__photo" />
      </Parallax>
    );
  }
  if (slot.kind === 'missing') {
    return (
      <PhotoPlaceholder label={slot.label} files={slot.files} className="story-visual__placeholder">
        {art}
      </PhotoPlaceholder>
    );
  }
  return <>{art}</>;
}

const sizes = '(min-width: 64rem) 45vw, 100vw';

const chapters = [
  {
    id: 'shop',
    kicker: 'Before',
    title: 'It started life as a pet shop',
    body: (
      <p>
        Before the candles, the sherry and the clink of small plates, {venue.address.street} — just past Tooting
        Broadway — was the local pet shop. Today its door opens onto something rather more glamorous.
      </p>
    ),
    visual: <SlotVisual slot={slotPhotos.shopfront} art={<ShopfrontArt />} sizes={sizes} />,
  },
  {
    id: 'founders',
    kicker: 'The founders',
    title: 'Two Tooting locals',
    body: (
      <>
        <p>
          Hikmat Antippa and Madeleine Lim both call Tooting home. Their idea was simple: bring a little Iberian glamour
          to the High Street — inventive tapas, really good ingredients and surroundings worth lingering in.
        </p>
        <ul role="list" className="founders">
          {venue.founders.map((founder) => (
            <li key={founder.name} className="founder marble">
              <p className="founder__role">{founder.role}</p>
              <h4 className="founder__name display">{founder.name}</h4>
              <p className="founder__bio">{founder.bio}</p>
            </li>
          ))}
        </ul>
      </>
    ),
    visual: <FoundersArt />,
  },
  {
    id: 'rooms',
    kicker: 'Now',
    title: 'Two rooms, two moods',
    body: (
      <>
        <p>
          Come for a glass and a few bites, or settle in for the night. Both rooms are candlelit, and both are at their
          buzziest after 8.30pm.
        </p>
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
      </>
    ),
    visual: <SlotVisual slot={slotPhotos.rooms} art={<RoomsArt />} sizes={sizes} />,
  },
];

function Chapter({
  chapter,
  index,
  onActive,
}: {
  chapter: (typeof chapters)[number];
  index: number;
  onActive: (i: number) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { margin: '-45% 0px -45% 0px' });
  useEffect(() => {
    if (inView) onActive(index);
  }, [inView, index, onActive]);

  return (
    <article ref={ref} className="chapter" aria-labelledby={`chapter-${chapter.id}`}>
      <Reveal className="chapter__visual-inline">
        <div className="story-visual">{chapter.visual}</div>
      </Reveal>
      <Reveal className="chapter__text">
        <p className="chapter__kicker">
          <span className="num">0{index + 1}</span>
          {chapter.kicker}
        </p>
        <h3 id={`chapter-${chapter.id}`} className="chapter__title display">
          {chapter.title}
        </h3>
        <div className="chapter__body prose">{chapter.body}</div>
      </Reveal>
    </article>
  );
}

export function Story() {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start center', 'end center'] });
  const progress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="story" className="section story" aria-labelledby="story-title">
      <div className="container">
        <SectionHeading
          id="story-title"
          number="02"
          eyebrow="Nuestra historia"
          title={
            <>
              From pet shop <em>to taperia</em>
            </>
          }
        />

        <div ref={trackRef} className="story__track">
          <div className="story__stage" aria-hidden="true">
            <div className="story__frame">
              <AnimatePresence initial={false}>
                <motion.div
                  key={active}
                  className="story-visual story-visual--stage"
                  initial={{ opacity: 0, scale: 1.06, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.98, filter: 'blur(8px)' }}
                  transition={softSpring}
                >
                  {chapters[active].visual}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="story__progress">
              <motion.span className="story__progress-fill" style={{ scaleY: progress }} />
              {chapters.map((chapter, i) => (
                <span
                  key={chapter.id}
                  className={`story__tick ${i <= active ? 'is-on' : ''}`}
                  style={{ top: `${(i / (chapters.length - 1)) * 100}%` }}
                />
              ))}
            </div>
          </div>

          <div className="story__chapters">
            {chapters.map((chapter, index) => (
              <Chapter key={chapter.id} chapter={chapter} index={index} onActive={setActive} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
