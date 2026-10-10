import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { venue } from '../../data/venue';
import { availableSlots, formatSlot, upcomingDays, type CalendarDay } from '../../lib/hours';
import { spring } from '../../lib/motion';
import { useLondonNow } from '../../lib/now';
import { Icon } from '../ui/Icon';
import { RadioGroup } from '../ui/RadioGroup';
import { Stepper } from '../ui/Stepper';

type Seating = 'inside' | 'outside';

const DAYS_AHEAD = 28;
const MAX_PARTY = 40;
const BIG_GROUP = 10;
/** From this time the room is at its buzziest. */
const BUZZ_FROM = 20 * 60 + 30;

function outdoorEmail(party: number, day: CalendarDay | undefined, time: number | null) {
  const subject = `Outdoor table request — ${party} ${party === 1 ? 'guest' : 'guests'}`;
  const lines = [
    'Hello,',
    '',
    `I’d like to request an outdoor table for ${party}${day ? ` on ${day.long}` : ''}${time !== null ? ` at ${formatSlot(time)}` : ''}.`,
    '',
    'Name:',
    'Phone:',
  ];
  return `mailto:${venue.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
}

export function BookingPanel() {
  const now = useLondonNow();
  const days = useMemo(() => upcomingDays(now, DAYS_AHEAD), [now]);
  const firstOpenDay = days.find((day) => availableSlots(day, now).length > 0) ?? days[1];

  const [seating, setSeating] = useState<Seating>('inside');
  const [party, setParty] = useState(2);
  const [date, setDate] = useState(firstOpenDay.isoDate);
  const [time, setTime] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const justSubmitted = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const cameBack = useRef(false);

  const day = days.find((d) => d.isoDate === date) ?? firstOpenDay;
  const slots = useMemo(() => availableSlots(day, now), [day, now]);

  // Drop a chosen time that no longer exists for the chosen day
  useEffect(() => {
    if (time !== null && !slots.includes(time)) setTime(null);
  }, [slots, time]);

  // The form and the preview card swap after an exit animation, so focus follows on mount
  const focusResult = (el: HTMLDivElement | null) => {
    if (el && justSubmitted.current) {
      justSubmitted.current = false;
      el.focus();
    }
  };
  const focusSubmitOnReturn = (el: HTMLButtonElement | null) => {
    if (el && cameBack.current) {
      cameBack.current = false;
      el.focus();
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (time === null) {
      setError('Choose a time to continue.');
      formRef.current?.querySelector<HTMLElement>('.time-grid [tabindex="0"]')?.focus();
      return;
    }
    setError('');
    justSubmitted.current = true;
    setSubmitted(true);
  };

  const summary = `${party} ${party === 1 ? 'guest' : 'guests'} · ${day.long}${time !== null ? ` · ${formatSlot(time)}` : ''} · ${seating === 'inside' ? 'Inside' : 'Outside'}`;

  return (
    <div className="booking">
      <AnimatePresence mode="wait" initial={false}>
        {!submitted ? (
          <motion.form
            key="form"
            ref={formRef}
            className="booking__form"
            onSubmit={onSubmit}
            noValidate
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={spring}
            aria-label="Find a table"
          >
            <div className="booking__row">
              <p className="booking__label" id="seating-label">
                Where
              </p>
              <RadioGroup<Seating>
                label="Seating"
                labelledBy="seating-label"
                className="segmented"
                value={seating}
                onChange={setSeating}
                options={[
                  { value: 'inside', label: 'Inside' },
                  { value: 'outside', label: 'Outside' },
                ]}
              />
            </div>

            <div className="booking__row">
              <p className="booking__label" id="party-label">
                Party size
              </p>
              <Stepper
                label="Party size"
                value={party}
                min={1}
                max={MAX_PARTY}
                onChange={setParty}
                unit={(n) => (n === 1 ? 'guest' : 'guests')}
                noun="guests"
                size="large"
              />
            </div>
            {party >= BIG_GROUP && (
              <p className="booking__hint">
                <Icon name="people" /> Any party size is welcome. Thinking of taking over the place? See{' '}
                <a href="#private-hire" className="text-link">
                  private hire
                </a>
                .
              </p>
            )}

            <div className="booking__block">
              <p className="booking__label" id="date-label">
                Date <span className="booking__value">{day.long}</span>
              </p>
              <RadioGroup
                label="Date"
                labelledBy="date-label"
                className="date-strip"
                value={date}
                onChange={setDate}
                options={days.map((d) => ({
                  value: d.isoDate,
                  ariaLabel: `${d.relative ? `${d.relative}, ` : ''}${d.long}`,
                  className: availableSlots(d, now).length === 0 ? 'is-full' : '',
                  label: (
                    <>
                      <span className="date-strip__weekday">{d.relative === 'Today' ? 'Today' : d.weekday}</span>
                      <span className="date-strip__day display num">{d.dayOfMonth}</span>
                      <span className="date-strip__month">{d.month}</span>
                    </>
                  ),
                }))}
              />
            </div>

            <div className="booking__block">
              <p className="booking__label" id="time-label">
                Time {time !== null && <span className="booking__value num">{formatSlot(time)}</span>}
              </p>
              {slots.length > 0 ? (
                <RadioGroup
                  label="Time"
                  labelledBy="time-label"
                  describedBy={error ? 'booking-error' : 'buzz-note'}
                  className="time-grid"
                  value={time}
                  onChange={(t) => {
                    setTime(t);
                    setError('');
                  }}
                  options={slots.map((slot) => ({
                    value: slot,
                    className: slot >= BUZZ_FROM ? 'is-buzzy' : '',
                    label: <span className="num">{formatSlot(slot)}</span>,
                  }))}
                />
              ) : (
                <p className="booking__hint">No more tables today — pick another day.</p>
              )}
              <p className="booking__note" id="buzz-note">
                <span className="booking__buzz-dot" aria-hidden="true" /> After 8.30pm the rooms are at their buzziest.
              </p>
            </div>

            {error && (
              <p className="booking__error" id="booking-error" role="alert">
                {error}
              </p>
            )}

            <div className="booking__submit">
              <button ref={focusSubmitOnReturn} type="submit" className="btn btn--primary btn--block">
                {seating === 'inside' ? 'Find a table' : 'Request an outdoor table'} <Icon name="arrowRight" />
              </button>
              <p className="booking__fine">
                {seating === 'inside'
                  ? 'Inside tables are booked through our online booking system.'
                  : 'Outdoor tables are booked by email only.'}
              </p>
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="result"
            ref={focusResult}
            className="booking__result marble"
            tabIndex={-1}
            role="region"
            aria-labelledby="booking-result-title"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            transition={spring}
          >
            <p className="preview-tag">
              <Icon name="info" /> Preview — nothing has been booked
            </p>
            <h3 id="booking-result-title" className="booking__result-title display">
              {seating === 'inside' ? 'Your table, nearly' : 'Outdoor tables are booked by email'}
            </h3>
            <p className="booking__summary num">{summary}</p>
            {seating === 'inside' ? (
              <p>
                This is a design preview. On the live site, these details would go straight to The Little Taperia’s
                existing ResDiary booking system, which checks availability and confirms your table. To book for real,
                use ResDiary or give the team a call.
              </p>
            ) : (
              <p>
                This is a design preview, so nothing has been sent. Outdoor tables are booked by email: the button below
                opens a draft in your own email app with these details filled in, ready for you to check and send.
              </p>
            )}
            <div className="booking__result-actions">
              {seating === 'inside' ? (
                <a href={venue.bookingUrl} className="btn btn--dark" target="_blank" rel="noopener noreferrer">
                  Book on ResDiary <Icon name="external" />
                  <span className="visually-hidden">(opens in a new tab)</span>
                </a>
              ) : (
                <a href={outdoorEmail(party, day, time)} className="btn btn--dark">
                  <Icon name="mail" /> Write the email
                </a>
              )}
              <a href={`tel:${venue.phone.tel}`} className="btn btn--outline-dark">
                <Icon name="phone" /> {venue.phone.display}
              </a>
            </div>
            <button
              type="button"
              className="booking__back"
              onClick={() => {
                cameBack.current = true;
                setSubmitted(false);
              }}
            >
              <Icon name="arrowLeft" /> Change details
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
