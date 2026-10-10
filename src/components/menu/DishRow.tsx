import { allergens, type Allergen, type Dish } from '../../data/menu';
import { formatPrice } from '../../lib/format';

const label = (id: Allergen) => allergens.find((a) => a.id === id)!.label;

function Price({ price }: { price: number }) {
  return (
    <>
      <span className="dish__leader" aria-hidden="true" />
      <span className="dish__price num">{formatPrice(price)}</span>
    </>
  );
}

/** One dish as it reads on the printed menu: name, price, what's in it. */
export function DishRow({ dish, excluded }: { dish: Dish; excluded: Allergen[] }) {
  const flagged = dish.allergens.filter((a) => excluded.includes(a));
  const dimmed = flagged.length > 0;
  // An option without a label is the dish itself; labelled ones are variations on it
  const plain = dish.options.find((option) => !option.label);
  const variations = dish.options.filter((option) => option.label);

  return (
    <li className={`dish ${dimmed ? 'is-dimmed' : ''}`}>
      <div className="dish__line">
        <h4 className="dish__name">{dish.name}</h4>
        {plain && <Price price={plain.price} />}
      </div>
      {dish.detail && <p className="dish__detail">{dish.detail}</p>}
      {variations.length > 0 && (
        <ul role="list" className="dish__options">
          {variations.map((option) => (
            <li key={option.id} className="dish__line">
              <span className="dish__option">{option.label}</span>
              <Price price={option.price} />
            </li>
          ))}
        </ul>
      )}
      {dish.allergens.length > 0 && (
        <p className="dish__allergens">
          <span className="visually-hidden">Contains </span>
          {dish.allergens.map((a, i) => (
            <span key={a} className={flagged.includes(a) ? 'is-flagged' : undefined}>
              {i > 0 && <span aria-hidden="true"> · </span>}
              {label(a)}
            </span>
          ))}
          {dimmed && <span className="visually-hidden"> (not free from your filter choices)</span>}
        </p>
      )}
    </li>
  );
}
