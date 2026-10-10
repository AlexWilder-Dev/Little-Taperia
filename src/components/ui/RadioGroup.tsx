import { useRef, type KeyboardEvent, type ReactNode } from 'react';

export interface RadioOption<T extends string | number> {
  value: T;
  label: ReactNode;
  /** Accessible name when the visible label is abbreviated. */
  ariaLabel?: string;
  className?: string;
}

interface RadioGroupProps<T extends string | number> {
  label: string;
  labelledBy?: string;
  options: RadioOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  className?: string;
  describedBy?: string;
}

/** A radio group of styled buttons with roving focus: arrows move and select, Home/End jump. */
export function RadioGroup<T extends string | number>({
  label,
  labelledBy,
  options,
  value,
  onChange,
  className = '',
  describedBy,
}: RadioGroupProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = options.findIndex((o) => o.value === value);
  const focusIndex = selectedIndex >= 0 ? selectedIndex : 0;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = refs.current.findIndex((el) => el === document.activeElement);
    if (current < 0) return;
    let next = -1;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = Math.min(options.length - 1, current + 1);
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = Math.max(0, current - 1);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = options.length - 1;
    if (next < 0) return;
    event.preventDefault();
    onChange(options[next].value);
    const el = refs.current[next];
    el?.focus();
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };

  return (
    <div
      role="radiogroup"
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className={className}
      onKeyDown={onKeyDown}
    >
      {options.map((option, index) => {
        const checked = option.value === value;
        return (
          <button
            key={String(option.value)}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={option.ariaLabel}
            tabIndex={index === focusIndex ? 0 : -1}
            className={`radio-option ${option.className ?? ''}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
