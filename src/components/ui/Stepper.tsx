import { Icon } from './Icon';
import './Stepper.css';

interface StepperProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  /** Text after the number, e.g. "guests". */
  unit?: (value: number) => string;
  size?: 'regular' | 'large';
  /** Plural noun for the button labels: "Fewer guests", "More guests". */
  noun: string;
}

export function Stepper({ label, value, min, max, onChange, unit, size = 'regular', noun }: StepperProps) {
  return (
    <div className={`stepper stepper--${size}`} role="group" aria-label={label}>
      <button
        type="button"
        className="icon-btn"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={`Fewer ${noun}`}
      >
        <Icon name="minus" />
      </button>
      <output className="stepper__value num" aria-live="polite" aria-atomic="true">
        <span className="stepper__number">{value}</span>
        {unit && <span className="stepper__unit"> {unit(value)}</span>}
      </output>
      <button
        type="button"
        className="icon-btn"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`More ${noun}`}
      >
        <Icon name="plus" />
      </button>
    </div>
  );
}
