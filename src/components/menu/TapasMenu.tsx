import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { allergens, menu, type Allergen } from '../../data/menu';
import { venue } from '../../data/venue';
import { slotPhotos } from '../../lib/images';
import { softSpring } from '../../lib/motion';
import { usePlan } from '../../lib/plan';
import { plural } from '../../lib/format';
import { Icon } from '../ui/Icon';
import { Photo } from '../ui/Photo';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';
import { Tabs, panelId, tabId } from '../ui/Tabs';
import { DishRow } from './DishRow';
import './TapasMenu.css';

const allergenLabel = (id: Allergen) => allergens.find((a) => a.id === id)!.label.toLowerCase();

const listFormat = new Intl.ListFormat('en-GB', { style: 'long', type: 'conjunction' });

/** Which menu section shows the seafood photo slot. */
const PHOTO_SECTION = 'mariscos';

function SectionPhoto() {
  const slot = slotPhotos.seafood;
  if (slot.kind !== 'photo') return null;
  return (
    <figure className="menu__photo">
      <Photo
        image={slot.image}
        sizes="(min-width: 64rem) 28vw, 90vw"
        className="frame"
        noUpscale
        style={{ aspectRatio: `${slot.image.w} / ${slot.image.h}` }}
      />
      <figcaption className="caption">{slot.image.alt}</figcaption>
    </figure>
  );
}

export function TapasMenu() {
  const [sectionId, setSectionId] = useState(menu[0].id);
  const [excluded, setExcluded] = useState<Allergen[]>([]);
  const { plates, setOpen } = usePlan();
  const section = menu.find((s) => s.id === sectionId)!;

  const toggle = (id: Allergen) =>
    setExcluded((current) => (current.includes(id) ? current.filter((a) => a !== id) : [...current, id]));

  const freeCount = section.dishes.filter((dish) => !dish.allergens.some((a) => excluded.includes(a))).length;
  const status = excluded.length
    ? `${freeCount} of ${section.dishes.length} ${section.title} dishes are free from ${listFormat.format(excluded.map(allergenLabel))}.`
    : '';

  return (
    <section id="menu" className="section section--surface menu" aria-labelledby="menu-title">
      <div className="container">
        <div className="menu__head">
          <SectionHeading
            id="menu-title"
            eyebrow="La carta"
            title={
              <>
                Tapas <em>to share</em>
              </>
            }
          >
            Small plates for passing around the table. Order a few at a time and keep them coming — around three plates
            each is about right.
          </SectionHeading>
          <Reveal className="menu__plan-hint" delay={0.1}>
            <Icon name="plate" />
            <p>
              Tap{' '}
              <span className="menu__plus" aria-hidden="true">
                +
              </span>
              <span className="visually-hidden">the add button</span> on any dish to plan your table — we’ll count the
              plates and total it up.
            </p>
            {plates > 0 && (
              <button type="button" className="btn btn--small" onClick={() => setOpen(true)}>
                View your table · {plural(plates, 'plate')}
              </button>
            )}
          </Reveal>
        </div>

        <Reveal className="menu__controls">
          <Tabs
            items={menu.map((s) => ({ id: s.id, label: s.title }))}
            value={sectionId}
            onChange={setSectionId}
            idPrefix="tapas"
            label="Menu sections"
            className="menu__tabs"
          />
          <div className="menu__filters" role="group" aria-labelledby="free-from-label">
            <span id="free-from-label" className="menu__filters-label">
              Free from
            </span>
            {allergens.map((a) => {
              const pressed = excluded.includes(a.id);
              return (
                <button key={a.id} type="button" className="chip" aria-pressed={pressed} onClick={() => toggle(a.id)}>
                  <span className="chip__check" aria-hidden="true">
                    <Icon name="check" />
                  </span>
                  {a.label}
                </button>
              );
            })}
            {excluded.length > 0 && (
              <button type="button" className="chip chip--clear" onClick={() => setExcluded([])}>
                Clear
              </button>
            )}
          </div>
        </Reveal>

        <p className="menu__status" role="status">
          {status}
        </p>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={section.id}
            role="tabpanel"
            id={panelId('tapas', section.id)}
            aria-labelledby={tabId('tapas', section.id)}
            className="menu__panel"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={softSpring}
          >
            <div className="menu__aside">
              <h3 className="menu__section-title display">{section.title}</h3>
              <p className="menu__section-sub">{section.subtitle}</p>
              <p className="menu__section-count num">{plural(section.dishes.length, 'dish', 'dishes')}</p>
              {section.id === PHOTO_SECTION && <SectionPhoto />}
            </div>
            <ul role="list" className="dishes">
              {section.dishes.map((dish, index) => (
                <DishRow key={dish.id} dish={dish} index={index} excluded={excluded} />
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>

        <Reveal className="menu__notice">
          <Icon name="info" />
          <div>
            <p>
              <strong>Allergies.</strong> {venue.allergenNotice}
            </p>
            <p>The free-from filter is a guide to the main allergens listed for each dish, not a guarantee.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
