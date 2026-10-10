import { useRef, type KeyboardEvent } from 'react';
import './Tabs.css';

export interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  /** Prefix for tab and panel ids; panels use `${idPrefix}-panel-${id}`. */
  idPrefix: string;
  label: string;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const tabId = (prefix: string, id: string) => `${prefix}-tab-${id}`;
export const panelId = (prefix: string, id: string) => `${prefix}-panel-${id}`;

/** WAI-ARIA tabs with automatic activation, arrow keys, Home and End. */
export function Tabs({
  items,
  value,
  onChange,
  idPrefix,
  label,
  orientation = 'horizontal',
  className = '',
}: TabsProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = items.findIndex((item) => item.id === value);
    const prevKeys = orientation === 'vertical' ? ['ArrowUp', 'ArrowLeft'] : ['ArrowLeft'];
    const nextKeys = orientation === 'vertical' ? ['ArrowDown', 'ArrowRight'] : ['ArrowRight'];
    let next = -1;
    if (nextKeys.includes(event.key)) next = (current + 1) % items.length;
    else if (prevKeys.includes(event.key)) next = (current - 1 + items.length) % items.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = items.length - 1;
    if (next < 0) return;
    event.preventDefault();
    onChange(items[next].id);
    const button = refs.current[next];
    button?.focus();
    button?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      aria-orientation={orientation}
      className={`tabs tabs--${orientation} ${className}`}
      onKeyDown={onKeyDown}
    >
      {items.map((item, index) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="tab"
            id={tabId(idPrefix, item.id)}
            aria-selected={selected}
            aria-controls={panelId(idPrefix, item.id)}
            tabIndex={selected ? 0 : -1}
            className="tabs__tab"
            onClick={() => onChange(item.id)}
          >
            <span className="tabs__label">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
