import { AnimatePresence, motion } from 'framer-motion';
import { useId, useState } from 'react';
import { drinks, spiritsNote, type Drink, type DrinkGroup } from '../data/drinks';
import { formatPrice } from '../lib/format';
import { softSpring, spring } from '../lib/motion';
import { useMedia } from '../lib/useMedia';
import { CandleLight } from './effects/CandleLight';
import { Icon } from './ui/Icon';
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
          {group.title ? <h4 className="drink-group__title display">{group.title}</h4> : <span />}
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
        {group.items.map((drink, i) => (
          <motion.li
            key={drink.name}
            className="drink"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: Math.min(i, 12) * 0.03 }}
          >
            <span className="drink__text">
              <span className="drink__name">{drink.name}</span>
              {drink.detail && <span className="drink__detail">{drink.detail}</span>}
            </span>
            <span className="drink__leader" aria-hidden="true" />
            <Prices drink={drink} measures={group.measures?.length === 1 ? undefined : group.measures} />
          </motion.li>
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

  return (
    <section id="drinks" className="section drinks" aria-labelledby="drinks-title">
      <CandleLight className="drinks__lights" density={0.45} intensity={0.6} />
      <div className="container drinks__inner">
        <SectionHeading
          id="drinks-title"
          number="04"
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

        <div className="drinks__layout">
          <Reveal className="drinks__nav">
            <Tabs
              items={drinks.map((d) => ({ id: d.id, label: d.label }))}
              value={tab.id}
              onChange={setTab}
              idPrefix="drinks"
              label="Drinks list"
              orientation={desktop ? 'vertical' : 'horizontal'}
            />
          </Reveal>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab.id}
              role="tabpanel"
              id={panelId('drinks', tab.id)}
              aria-labelledby={tabId('drinks', tab.id)}
              className="drinks__panel"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={softSpring}
            >
              <div className="drinks__panel-head">
                <h3 className="drinks__display display" lang="es">
                  {tab.display}
                </h3>
                {tab.intro && <p className="drinks__intro">{tab.intro}</p>}
              </div>
              {tab.groups.map((group, i) => (
                <Group key={group.title ?? i} group={group} wide={desktop} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <Reveal className="drinks__spirits">
          <SpiritsAccordion />
        </Reveal>
      </div>
    </section>
  );
}
