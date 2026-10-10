import { AnimatePresence, motion, useDragControls, useReducedMotion, type PanInfo } from 'framer-motion';
import { useRef } from 'react';
import { venue } from '../data/venue';
import { formatMoney, formatPrice, plural } from '../lib/format';
import { softSpring, spring } from '../lib/motion';
import { MAX_GUESTS, MIN_GUESTS, usePlan } from '../lib/plan';
import { useDialog } from '../lib/useDialog';
import { useMedia } from '../lib/useMedia';
import { Icon } from './ui/Icon';
import { Portal } from './ui/Portal';
import { Stepper } from './ui/Stepper';
import './PlanTray.css';

const servicePercent = `${venue.serviceCharge * 100}%`;

function Suggestion({ plates, suggested, guests }: { plates: number; suggested: number; guests: number }) {
  const ratio = Math.min(1, plates / suggested);
  let message = `About ${suggested} plates suits ${plural(guests, 'guest')}.`;
  if (plates > 0 && plates < suggested) message += ` ${suggested - plates} more would round it out.`;
  if (plates >= suggested) message = `That’s a generous spread for ${plural(guests, 'guest')}.`;
  return (
    <div className="tray__suggestion">
      <div className="tray__meter" aria-hidden="true">
        <motion.span className="tray__meter-fill" animate={{ scaleX: ratio }} transition={spring} />
      </div>
      <p>{message}</p>
    </div>
  );
}

export function PlanTray() {
  const plan = usePlan();
  const panelRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLButtonElement>(null);
  const dragControls = useDragControls();
  const reduced = useReducedMotion();
  const desktop = useMedia('(min-width: 64rem)');
  const close = () => plan.setOpen(false);
  useDialog(plan.isOpen, panelRef, close);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 110 || info.velocity.y > 600) close();
  };

  return (
    <>
      <div className="visually-hidden" aria-live="polite" aria-atomic="true">
        {plan.announcement}
      </div>

      <AnimatePresence>
        {desktop && plan.plates > 0 && (
          <motion.button
            type="button"
            className="tray-launcher"
            onClick={() => plan.setOpen(true)}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={spring}
          >
            <span className="tray-launcher__count num">{plan.plates}</span>
            <span className="tray-launcher__label">Your table</span>
            <span className="tray-launcher__total num">{formatMoney(plan.total)}</span>
          </motion.button>
        )}
      </AnimatePresence>

      <Portal>
        <AnimatePresence>
          {plan.isOpen && (
            <>
              <motion.div
                className="tray-backdrop"
                onClick={close}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
              />
              <motion.div
                ref={panelRef}
                className="tray"
                role="dialog"
                aria-modal="true"
                aria-labelledby="tray-title"
                tabIndex={-1}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%', transition: { duration: 0.32, ease: [0.4, 0, 1, 1] } }}
                transition={softSpring}
                drag={desktop || reduced ? false : 'y'}
                dragControls={dragControls}
                dragListener={false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.6 }}
                onDragEnd={onDragEnd}
              >
                <div className="tray__grip" onPointerDown={(event) => dragControls.start(event)}>
                  <div className="tray__handle" aria-hidden="true" />
                </div>
                <header className="tray__header" onPointerDown={(event) => !desktop && dragControls.start(event)}>
                  <div>
                    <p className="eyebrow">Plan your table</p>
                    <h2 id="tray-title" className="tray__title display">
                      Your table
                    </h2>
                  </div>
                  <button type="button" className="icon-btn" onClick={close} aria-label="Close your table plan">
                    <Icon name="close" />
                  </button>
                </header>

                <div className="tray__scroll">
                  <div className="tray__guests">
                    <p className="tray__guests-label" id="guests-label">
                      <Icon name="people" /> Guests
                    </p>
                    <Stepper
                      label="Number of guests"
                      value={plan.guests}
                      min={MIN_GUESTS}
                      max={MAX_GUESTS}
                      onChange={plan.setGuests}
                      noun="guests"
                    />
                  </div>
                  <Suggestion plates={plan.plates} suggested={plan.suggestedPlates} guests={plan.guests} />

                  {plan.lines.length === 0 ? (
                    <p className="tray__empty">
                      Nothing on your table yet. Tap <strong>+</strong> next to any dish on the menu to start planning.
                    </p>
                  ) : (
                    <ul role="list" className="tray__lines">
                      <AnimatePresence initial={false}>
                        {plan.lines.map((line) => (
                          <motion.li
                            key={line.item.id}
                            className="tray__line"
                            layout
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={spring}
                          >
                            <div className="tray__line-main">
                              <p className="tray__line-name display">{line.item.name}</p>
                              <p className="tray__line-each num">{formatPrice(line.item.price)} each</p>
                            </div>
                            <div className="tray__line-qty">
                              <button
                                type="button"
                                className="icon-btn"
                                onClick={() => {
                                  if (line.qty === 1) panelRef.current?.focus();
                                  plan.remove(line.item.id);
                                }}
                                aria-label={`Remove one ${line.item.name}`}
                              >
                                <Icon name="minus" />
                              </button>
                              <span className="num">{line.qty}</span>
                              <button
                                type="button"
                                className="icon-btn"
                                onClick={() => plan.add(line.item.id)}
                                aria-label={`Add another ${line.item.name}`}
                              >
                                <Icon name="plus" />
                              </button>
                            </div>
                            <p className="tray__line-total num">{formatMoney(line.total)}</p>
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </ul>
                  )}
                </div>

                <footer className="tray__footer">
                  <dl className="tray__sums num">
                    <div>
                      <dt>Plates</dt>
                      <dd>{plan.plates}</dd>
                    </div>
                    <div>
                      <dt>Subtotal</dt>
                      <dd>{formatMoney(plan.subtotal)}</dd>
                    </div>
                    <div>
                      <dt>
                        Service {servicePercent} <span>(discretionary)</span>
                      </dt>
                      <dd>{formatMoney(plan.service)}</dd>
                    </div>
                    <div className="tray__grand">
                      <dt>Total</dt>
                      <dd>{formatMoney(plan.total)}</dd>
                    </div>
                  </dl>
                  <p className="tray__note">
                    <Icon name="info" /> A planning tool — order with your server.
                  </p>
                  <div className="tray__actions">
                    <button
                      type="button"
                      className="btn btn--small"
                      onClick={() => {
                        plan.clear();
                        doneRef.current?.focus();
                      }}
                      disabled={plan.plates === 0}
                    >
                      Clear
                    </button>
                    <button ref={doneRef} type="button" className="btn btn--primary btn--small" onClick={close}>
                      Keep browsing
                    </button>
                  </div>
                </footer>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}
