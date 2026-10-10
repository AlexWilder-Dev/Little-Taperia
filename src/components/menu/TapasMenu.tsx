import { useEffect, useRef, useState } from 'react';
import { allergens, menu, type Allergen, type Dish } from '../../data/menu';
import { venue } from '../../data/venue';
import { slotPhotos } from '../../lib/images';
import { useActiveSection } from '../../lib/useActiveSection';
import { Icon } from '../ui/Icon';
import { Photo } from '../ui/Photo';
import { Reveal } from '../ui/Reveal';
import { DishRow } from './DishRow';
import './TapasMenu.css';

const allergenLabel = (id: Allergen) => allergens.find((a) => a.id === id)!.label.toLowerCase();

const listFormat = new Intl.ListFormat('en-GB', { style: 'long', type: 'conjunction' });

const numberWords = ['no', 'one', 'two', 'three', 'four', 'five'];

/** Which menu section shows the seafood photo slot. */
const PHOTO_SECTION = 'mariscos';

const sectionAnchor = (id: string) => `menu-${id}`;
const anchors = menu.map((section) => sectionAnchor(section.id));

// Some dishes appear in two sections; count each once
const dishes = [...new Map(menu.flatMap((section) => section.dishes).map((dish) => [dish.id, dish])).values()];
const isFreeFrom = (dish: Dish, excluded: Allergen[]) => !dish.allergens.some((a) => excluded.includes(a));

function SectionPhoto() {
  const slot = slotPhotos.seafood;
  if (slot.kind !== 'photo') return null;
  return (
    <figure className="carta__photo">
      <Photo
        image={slot.image}
        sizes="(min-width: 64rem) 20rem, 90vw"
        noUpscale
        style={{ aspectRatio: `${slot.image.w} / ${slot.image.h}` }}
      />
      <figcaption className="caption">{slot.image.alt}</figcaption>
    </figure>
  );
}

export function TapasMenu() {
  const [excluded, setExcluded] = useState<Allergen[]>([]);
  const active = useActiveSection(anchors);
  const indexRef = useRef<HTMLOListElement>(null);

  // On small screens the section index scrolls sideways; keep the current section in view
  useEffect(() => {
    const list = indexRef.current;
    const link = list?.querySelector<HTMLElement>('.is-active');
    if (!list || !link || list.scrollWidth <= list.clientWidth) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    list.scrollTo({
      left: link.offsetLeft - list.clientWidth / 2 + link.offsetWidth / 2,
      behavior: reduced ? 'auto' : 'smooth',
    });
  }, [active]);

  const toggle = (id: Allergen) =>
    setExcluded((current) => (current.includes(id) ? current.filter((a) => a !== id) : [...current, id]));

  const freeCount = dishes.filter((dish) => isFreeFrom(dish, excluded)).length;
  const status = excluded.length
    ? `${freeCount} of ${dishes.length} dishes are free from ${listFormat.format(excluded.map(allergenLabel))}. The rest are struck through.`
    : '';

  return (
    <section id="menu" className="section menu" aria-labelledby="menu-title">
      <div className="container">
        <Reveal className="menu__head">
          <p className="eyebrow">La carta</p>
          <h2 id="menu-title" className="menu__title display">
            Tapas <em>to share</em>
          </h2>
          <p className="menu__intro lede">
            Small plates for passing round the table. About{' '}
            {numberWords[venue.platesPerPerson] ?? venue.platesPerPerson} each is a good place to start.
          </p>
        </Reveal>

        <div className="menu__layout">
          <div className="menu__rail">
            <nav className="menu__index" aria-label="Menu sections">
              <ol role="list" ref={indexRef}>
                {menu.map((section) => {
                  const current = active === sectionAnchor(section.id);
                  return (
                    <li key={section.id}>
                      <a
                        href={`#${sectionAnchor(section.id)}`}
                        className={current ? 'is-active' : undefined}
                        aria-current={current ? 'location' : undefined}
                      >
                        {section.title}
                      </a>
                    </li>
                  );
                })}
              </ol>
            </nav>

            <div className="menu__filters" role="group" aria-labelledby="free-from-label">
              <p id="free-from-label" className="menu__filters-label">
                Free from
              </p>
              <div className="menu__chips">
                {allergens.map((a) => {
                  const pressed = excluded.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      className="chip"
                      aria-pressed={pressed}
                      onClick={() => toggle(a.id)}
                    >
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
              <p className="menu__status" role="status">
                {status}
              </p>
            </div>
          </div>

          <div className="menu__carta">
            {menu.map((section) => (
              <section
                key={section.id}
                id={sectionAnchor(section.id)}
                className="carta"
                aria-labelledby={`${sectionAnchor(section.id)}-title`}
              >
                <div className="carta__head">
                  <h3 id={`${sectionAnchor(section.id)}-title`} className="carta__title display">
                    {section.title}
                  </h3>
                  <p className="carta__sub">{section.subtitle}</p>
                </div>
                {section.id === PHOTO_SECTION && <SectionPhoto />}
                <ul role="list" className="carta__dishes">
                  {section.dishes.map((dish) => (
                    <DishRow key={dish.id} dish={dish} excluded={excluded} />
                  ))}
                </ul>
              </section>
            ))}

            <aside className="menu__notice" aria-label="Allergies">
              <Icon name="info" />
              <div>
                <p>
                  <strong>Allergies.</strong> {venue.allergenNotice}
                </p>
                <p>The free-from filter is a guide to the main allergens listed for each dish, not a guarantee.</p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
