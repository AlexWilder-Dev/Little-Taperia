import { AnimatePresence, motion } from 'framer-motion';
import { useRef } from 'react';
import { allergens, type Allergen, type Dish, type DishOption } from '../../data/menu';
import { formatPrice } from '../../lib/format';
import { snappy, spring } from '../../lib/motion';
import { usePlan } from '../../lib/plan';
import { Icon } from '../ui/Icon';

const label = (id: Allergen) => allergens.find((a) => a.id === id)!.label;

function AddControl({ option, dishName }: { option: DishOption; dishName: string }) {
  const { quantities, add, remove } = usePlan();
  const qty = quantities[option.id] ?? 0;
  const name = option.name ?? dishName;
  // The add button and the stepper swap places, so hand focus across when they do.
  const focusNext = useRef<'add' | 'stepper' | null>(null);
  const claimFocus = (target: 'add' | 'stepper') => (el: HTMLButtonElement | null) => {
    if (el && focusNext.current === target) {
      focusNext.current = null;
      el.focus();
    }
  };

  return (
    <div className="add-control">
      <AnimatePresence initial={false} mode="popLayout">
        {qty > 0 ? (
          <motion.div
            key="stepper"
            className="add-control__stepper"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={snappy}
          >
            <button
              type="button"
              onClick={() => {
                if (qty === 1) focusNext.current = 'add';
                remove(option.id);
              }}
              aria-label={`Remove one ${name} from your table`}
            >
              <Icon name="minus" />
            </button>
            <motion.span
              key={qty}
              className="add-control__qty num"
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={snappy}
            >
              {qty}
            </motion.span>
            <button
              ref={claimFocus('stepper')}
              type="button"
              onClick={() => add(option.id)}
              aria-label={`Add another ${name}`}
            >
              <Icon name="plus" />
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="add"
            ref={claimFocus('add')}
            type="button"
            className="add-control__add"
            onClick={() => {
              focusNext.current = 'stepper';
              add(option.id);
            }}
            aria-label={`Add ${name} to your table`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileTap={{ scale: 0.88 }}
            transition={snappy}
          >
            <Icon name="plus" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DishRow({ dish, index, excluded }: { dish: Dish; index: number; excluded: Allergen[] }) {
  const flagged = dish.allergens.filter((a) => excluded.includes(a));
  const dimmed = flagged.length > 0;

  return (
    <motion.li
      className={`dish ${dimmed ? 'is-dimmed' : ''}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.04 * index }}
    >
      <div className="dish__main">
        <h4 className="dish__name display">{dish.name}</h4>
        {dish.detail && <p className="dish__detail">{dish.detail}</p>}
        {dish.allergens.length > 0 && (
          <p className="dish__allergens">
            <span className="visually-hidden">Contains </span>
            {dish.allergens.map((a, i) => (
              <span key={a} className={flagged.includes(a) ? 'is-flagged' : undefined}>
                {i > 0 && <span aria-hidden="true"> · </span>}
                {label(a)}
              </span>
            ))}
            {dimmed && <span className="visually-hidden"> (filtered out)</span>}
          </p>
        )}
      </div>
      <div className="dish__options">
        {dish.options.map((option) => (
          <div key={option.id} className="dish__option">
            {option.label && <span className="dish__option-label">{option.label}</span>}
            <span className="dish__price num">{formatPrice(option.price)}</span>
            <AddControl option={option} dishName={dish.name} />
          </div>
        ))}
      </div>
    </motion.li>
  );
}
