import { useState, type ReactNode } from 'react';
import { drinks, spiritsNote, type Drink, type DrinkGroup, type DrinkTab } from '../data/drinks';
import { formatPrice } from '../lib/format';
import { slotPhotos } from '../lib/images';
import { useMedia } from '../lib/useMedia';
import { Photo } from './ui/Photo';
import { Reveal } from './ui/Reveal';
import { Tabs, panelId, tabId } from './ui/Tabs';
import './Drinks.css';

function Prices({ drink, measures }: { drink: Drink; measures?: string[] }) {
  // Items with their own measures (half / pint) show them inline
  if (drink.measures) {
    return (
      <span className="drink__prices drink__prices--inline num">
        {drink.prices.map((price, i) => (
          <span key={i}>
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
    <span className="drink__prices drink__prices--cols num">
      {measures.map((measure, i) => {
        const price = drink.prices[i];
        return (
          <span key={measure}>
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

function Group({ group, lead }: { group: DrinkGroup; lead?: ReactNode }) {
  const columns = group.measures && group.measures.length > 1 ? group.measures : undefined;
  return (
    <div className="drink-group">
      {lead}
      {(group.title || columns) && (
        <div className="drink-group__head">
          {group.title ? <h4 className="drink-group__title">{group.title}</h4> : <span />}
          {columns && (
            <span className="drink__prices drink__prices--cols drink-group__measures" aria-hidden="true">
              {columns.map((m) => (
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
            <Prices drink={drink} measures={columns} />
          </li>
        ))}
      </ul>
      {group.measures?.length === 1 && <p className="drink-group__note">All {group.measures[0]}</p>}
      {group.note && <p className="drink-group__note">{group.note}</p>}
    </div>
  );
}

function Category({ tab, headingId }: { tab: DrinkTab; headingId?: string }) {
  // The heading travels with the first group, so a board column never ends on a lone title
  const head = (
    <>
      <h3 id={headingId} className="board__heading">
        <span className="board__spanish chalk" lang="es">
          {tab.display}
        </span>
        <span className="board__english">{tab.label}</span>
      </h3>
      {tab.intro && <p className="board__intro">{tab.intro}</p>}
    </>
  );
  return (
    <>
      {tab.groups.map((group, i) => (
        <Group key={group.title ?? i} group={group} lead={i === 0 ? head : undefined} />
      ))}
    </>
  );
}

export function Drinks() {
  const [tabIdValue, setTab] = useState(drinks[0].id);
  // Wide screens get the whole board at once; small ones a tab at a time
  const wide = useMedia('(min-width: 64rem)');
  const tab = drinks.find((d) => d.id === tabIdValue)!;
  const shelf = slotPhotos.shelf;

  return (
    <section id="drinks" className="section drinks" aria-labelledby="drinks-title">
      <div className="container">
        <div className={`drinks__head ${shelf.kind === 'photo' ? 'drinks__head--photo' : ''}`}>
          <Reveal className="drinks__intro">
            <p className="eyebrow">La bodega</p>
            <h2 id="drinks-title" className="drinks__title display">
              Something <em>to drink</em>
            </h2>
            <p className="lede">
              Sherry and vermouth by the glass, Spanish gin tonics, cava, sangria by the jug and a wine list that
              wanders from Rías Baixas to Priorat.
            </p>
          </Reveal>
          {shelf.kind === 'photo' && (
            <Reveal className="drinks__photo" delay={0.08}>
              <Photo
                image={shelf.image}
                sizes={`${Math.min(shelf.image.w, 384)}px`}
                noUpscale
                style={{ aspectRatio: `${shelf.image.w} / ${shelf.image.h}` }}
              />
            </Reveal>
          )}
        </div>

        {wide ? (
          <div className="board">
            {drinks.map((category) => (
              <section key={category.id} className="board__category" aria-labelledby={`board-${category.id}`}>
                <Category tab={category} headingId={`board-${category.id}`} />
              </section>
            ))}
          </div>
        ) : (
          <div className="board board--tabs">
            <Tabs
              items={drinks.map((d) => ({ id: d.id, label: d.label }))}
              value={tab.id}
              onChange={setTab}
              idPrefix="drinks"
              label="Drinks list"
              className="board__tabs"
            />
            <div
              role="tabpanel"
              id={panelId('drinks', tab.id)}
              aria-labelledby={tabId('drinks', tab.id)}
              className="board__panel"
            >
              <Category tab={tab} />
            </div>
          </div>
        )}

        <p className="drinks__spirits">
          <strong>{spiritsNote.title}.</strong> {spiritsNote.body}
        </p>
      </div>
    </section>
  );
}
