import { AnimatePresence, motion } from 'framer-motion';
import { useRef, useState, type ChangeEvent, type FormEvent, type ReactElement } from 'react';
import { venue } from '../../data/venue';
import { spring } from '../../lib/motion';
import { useLondonNow } from '../../lib/now';
import { Icon } from '../ui/Icon';

interface Fields {
  name: string;
  email: string;
  phone: string;
  date: string;
  guests: string;
  message: string;
}

type Errors = Partial<Record<keyof Fields, string>>;

const empty: Fields = { name: '', email: '', phone: '', date: '', guests: '', message: '' };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(fields: Fields, today: string): Errors {
  const errors: Errors = {};
  if (!fields.name.trim()) errors.name = 'Please tell us your name.';
  if (!fields.email.trim()) errors.email = 'Please add an email address so the team can reply.';
  else if (!EMAIL.test(fields.email.trim())) errors.email = 'That email address doesn’t look quite right.';
  if (fields.phone.trim() && fields.phone.replace(/[^\d]/g, '').length < 10)
    errors.phone = 'Please check the phone number, or leave it blank.';
  if (!fields.date) errors.date = 'Please choose a preferred date.';
  else if (fields.date <= today) errors.date = 'Please choose a date after today.';
  const guests = Number(fields.guests);
  if (!fields.guests) errors.guests = 'Roughly how many guests?';
  else if (!Number.isInteger(guests) || guests < 1) errors.guests = 'Please enter a whole number of guests.';
  if (fields.message.trim().length < 10) errors.message = 'A line or two about the occasion helps the team plan.';
  return errors;
}

const labels: Record<keyof Fields, string> = {
  name: 'Your name',
  email: 'Email',
  phone: 'Phone (optional)',
  date: 'Preferred date',
  guests: 'Number of guests',
  message: 'Tell us about the occasion',
};

function enquiryEmail(fields: Fields) {
  const body = [
    `Name: ${fields.name}`,
    `Email: ${fields.email}`,
    fields.phone && `Phone: ${fields.phone}`,
    `Preferred date: ${fields.date}`,
    `Guests: ${fields.guests}`,
    '',
    fields.message,
  ]
    .filter((line) => line !== '')
    .join('\n');
  return `mailto:${venue.email}?subject=${encodeURIComponent('Private hire enquiry')}&body=${encodeURIComponent(body)}`;
}

export function PrivateHire() {
  const today = useLondonNow().isoDate;
  const [fields, setFields] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [attempted, setAttempted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const justSubmitted = useRef(false);
  const cameBack = useRef(false);

  const update = (key: keyof Fields) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = { ...fields, [key]: event.target.value };
    setFields(next);
    if (attempted) setErrors(validate(next, today));
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const found = validate(fields, today);
    setErrors(found);
    setAttempted(true);
    if (Object.keys(found).length > 0) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    justSubmitted.current = true;
    setSubmitted(true);
  };

  const field = (key: keyof Fields, input: (props: Record<string, unknown>) => ReactElement, wide = false) => {
    const id = `hire-${key}`;
    const error = errors[key];
    return (
      <div className={`field ${wide ? 'field--wide' : ''} ${error ? 'has-error' : ''}`}>
        <label htmlFor={id}>{labels[key]}</label>
        {input({
          id,
          name: key,
          value: fields[key],
          onChange: update(key),
          'aria-invalid': error ? true : undefined,
          'aria-describedby': error ? `${id}-error` : undefined,
        })}
        {error && (
          <p className="field__error" id={`${id}-error`}>
            {error}
          </p>
        )}
      </div>
    );
  };

  const errorList = Object.entries(errors) as [keyof Fields, string][];

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!submitted ? (
        <motion.form
          key="form"
          className="hire__form"
          onSubmit={onSubmit}
          noValidate
          aria-label="Private hire enquiry"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={spring}
        >
          {attempted && errorList.length > 0 && (
            <div
              ref={summaryRef}
              className="form-errors"
              tabIndex={-1}
              role="alert"
              aria-labelledby="hire-errors-title"
            >
              <p id="hire-errors-title">
                Please check {errorList.length === 1 ? 'one thing' : `${errorList.length} things`}:
              </p>
              <ul>
                {errorList.map(([key, message]) => (
                  <li key={key}>
                    <a href={`#hire-${key}`}>{message}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="hire__grid">
            {field('name', (p) => (
              <input type="text" autoComplete="name" required {...p} />
            ))}
            {field('email', (p) => (
              <input type="email" autoComplete="email" inputMode="email" required {...p} />
            ))}
            {field('phone', (p) => (
              <input type="tel" autoComplete="tel" inputMode="tel" {...p} />
            ))}
            {field('date', (p) => (
              <input type="date" min={today} required {...p} />
            ))}
            {field('guests', (p) => (
              <input type="number" min={1} step={1} inputMode="numeric" required {...p} />
            ))}
            {field(
              'message',
              (p) => (
                <textarea rows={4} required {...p} />
              ),
              true,
            )}
          </div>
          <div className="hire__submit">
            <button
              ref={(el) => {
                if (el && cameBack.current) {
                  cameBack.current = false;
                  el.focus();
                }
              }}
              type="submit"
              className="btn btn--cream"
            >
              Send enquiry <Icon name="arrowRight" />
            </button>
            <p className="booking__fine">Preview form — nothing is sent from this page.</p>
          </div>
        </motion.form>
      ) : (
        <motion.div
          key="sent"
          ref={(el) => {
            if (el && justSubmitted.current) {
              justSubmitted.current = false;
              el.focus();
            }
          }}
          className="booking__result marble"
          tabIndex={-1}
          role="region"
          aria-labelledby="hire-result-title"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={spring}
        >
          <p className="preview-tag">
            <Icon name="info" /> Preview — nothing has been sent
          </p>
          <h3 id="hire-result-title" className="booking__result-title display">
            Thanks, {fields.name.trim().split(' ')[0]}
          </h3>
          <p>
            This form isn’t connected yet, so your enquiry hasn’t gone anywhere. On the live site it would go straight
            to the team. For now, email them at{' '}
            <a href={`mailto:${venue.email}`} className="booking__link">
              {venue.email}
            </a>{' '}
            — the button below opens a draft with your details filled in, ready for you to send.
          </p>
          <div className="booking__result-actions">
            <a href={enquiryEmail(fields)} className="btn btn--dark">
              <Icon name="mail" /> Open as an email
            </a>
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
            <Icon name="arrowLeft" /> Edit enquiry
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
