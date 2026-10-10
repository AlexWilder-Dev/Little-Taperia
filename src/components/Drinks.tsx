import { AnimatePresence, motion } from 'framer-motion';
import { useId, useState } from 'react';
import { drinks, spiritsNote, type Drink, type DrinkGroup } from '../data/drinks';
import { formatPrice } from '../lib/format';
import { softSpring } from '../lib/motion';
import { slotPhotos } from '../lib/images';
import { useMedia } from '../lib/useMedia';
import { Icon } from './ui/Icon';
import { Photo } from './ui/Photo';
import { Reveal } from './ui/Reveal';
import { SectionHeading } from './ui/SectionHeading';
import { Tabs, panelId, tabId } from './ui/Tabs';
import './Drinks.css';

function Prices({ drink, measures }: { drink: Drink; measures?: string[] }) {
  // Items with their own measures (half / pint) show them inline
  if (drink.measures) {
    return (
      <span className="drink__prices drink__prices--inline num">
        {drink.prices.map((price, i) => (
          <span key={i} className="drink__price">
            {price !== null && formatPrice(price)} <small>{drink.measures![i]}</small>
          </span>
        ))}
      </span>
    );
  }
  // No column headings: a single price, or two run together ("3 / 4")
  if (!measures) {
    return (
      <span className="drink__prices num">
        {drink.prices
          .filter((p) => p !== null)
          .map(formatPrice)
          .join(' / ')}
      </span>
    );
  }
  return (
    <span className={`drink__prices drink__prices--cols drink__prices--${measures.length} num`}>
      {measures.map((measure, i) => {
        const price = drink.prices[i];
        return (
          <span key={measure} className="drink__price">
            <span className="visually-hidden">{measure} </span>
            {price === null || price === undefined ? (
              <>
                <span aria-hidden="true">–</span>
                <span className="visually-hidden">not available</span>
              </>
            ) : (
              formatPrice(price)
            )}
          </span>
        );
      })}
    </span>
  );
}

function Group({ group, wide }: { group: DrinkGroup; wide: boolean }) {
  const columns = group.measures && group.measures.length > 1;
  return (
    <div className={`drink-group ${wide && !columns ? 'drink-group--split' : ''}`}>
      {(group.title || group.measures) && (
        <div className="drink-group__head">
          {group.title ? <h4 className="drink-group__title chalk">{group.title}</h4> : <span />}
          {group.measures && (
            <span
              className={`drink-group__measures drink__prices--cols drink__prices--${group.measures.length}`}
              aria-hidden="true"
            >
              {group.measures.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </span>
          )}
        </div>
      )}
      <ul role="list" className="drink-list">
        {group.items.map((drink) => (
          <li key={drink.name} className="drink">
            <span className="drink__text">
              <span className="drink__name">{drink.name}</span>
              {drink.detail && <span className="drink__detail">{drink.detail}</span>}
            </span>
            <span className="drink__leader" aria-hidden="true" />
            <Prices drink={drink} measures={group.measures?.length === 1 ? undefined : group.measures} />
          </li>
        ))}
      </ul>
      {group.measures?.length === 1 && <p className="drink-group__note">All {group.measures[0]}</p>}
      {group.note && <p className="drink-group__note">{group.note}</p>}
    </div>
  );
}

function SpiritsAccordion() {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className={`spirits ${open ? 'is-open' : ''}`}>
      <h3 className="spirits__heading">
        <button
          type="button"
          className="spirits__toggle"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="display">{spiritsNote.title}</span>
          <Icon name="chevronDown" className="spirits__chevron" />
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            className="spirits__panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={softSpring}
          >
            <p>{spiritsNote.body}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Drinks() {
  const [tabIdValue, setTab] = useState(drinks[0].id);
  const desktop = useMedia('(min-width: 64rem)');
  const tab = drinks.find((d) => d.id === tabIdValue)!;
  const backBar = slotPhotos.backBar;

  return (
    <section id="drinks" className="section drinks" aria-labelledby="drinks-title">
      <div className="container">
        <div className={`drinks__head ${backBar.kind === 'photo' ? 'drinks__head--photo' : ''}`}>
          <SectionHeading
            id="drinks-title"
            eyebrow="La bodega"
            title={
              <>
                Something <em>to drink</em>
              </>
            }
          >
            Sherry and vermouth by the glass, Spanish gin tonics, cava, sangria by the jug and a wine list that wanders
            from Rías Baixas to Priorat.
          </SectionHeading>
          {backBar.kind === 'photo' && (
            <Reveal className="drinks__photo" delay={0.08}>
              <Photo
                image={backBar.image}
                sizes={`(min-width: 64rem) ${Math.min(backBar.image.w, 640)}px, 100vw`}
                className="frame"
                noUpscale
                style={{ aspectRatio: `${backBar.image.w} / ${backBar.image.h}` }}
              />
            </Reveal>
          )}
        </div>

        <Reveal className="board">
          <div className="board__nav">
            <Tabs
              items={drinks.map((d) => ({ id: d.id, label: d.label }))}
              value={tab.id}
              onChange={setTab}
              idPrefix="drinks"
              label="Drinks list"
              orientation={desktop ? 'vertical' : 'horizontal'}
            />
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab.id}
              role="tabpanel"
              id={panelId('drinks', tab.id)}
              aria-labelledby={tabId('drinks', tab.id)}
              className="board__panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="board__panel-head">
                <h3 className="board__title chalk" lang="es">
                  {tab.display}
                </h3>
                {tab.intro && <p className="board__intro">{tab.intro}</p>}
              </div>
              {tab.groups.map((group, i) => (
                <Group key={group.title ?? i} group={group} wide={desktop} />
              ))}
            </motion.div>
          </AnimatePresence>
        </Reveal>

        <Reveal className="drinks__spirits">
          <SpiritsAccordion />
        </Reveal>
      </div>
    </section>
  );
}
