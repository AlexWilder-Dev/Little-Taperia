import { venueStatus } from '../../lib/hours';
import { useLondonNow } from '../../lib/now';
import './HoursBadge.css';

/** Live open/closed status in London time. */
export function HoursBadge({ className = '', tone = 'glass' }: { className?: string; tone?: 'glass' | 'plain' }) {
  const status = venueStatus(useLondonNow());
  return (
    <p className={`hours-badge hours-badge--${status.kind} hours-badge--${tone} ${className}`}>
      <span className="hours-badge__dot" aria-hidden="true" />
      <span>{status.label}</span>
    </p>
  );
}
