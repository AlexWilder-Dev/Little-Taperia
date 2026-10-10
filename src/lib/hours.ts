import { venue } from '../data/venue';

/** A moment expressed in Europe/London local time. */
export interface LondonTime {
  /** 0 = Monday … 6 = Sunday, matching `venue.hours`. */
  dayIndex: number;
  /** Minutes after local midnight. */
  minutes: number;
  /** Local calendar date, yyyy-mm-dd. */
  isoDate: string;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const londonParts = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/London',
  weekday: 'short',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export function londonTime(date: Date = new Date()): LondonTime {
  const parts: Record<string, string> = {};
  for (const part of londonParts.formatToParts(date)) parts[part.type] = part.value;
  return {
    dayIndex: WEEKDAYS.indexOf(parts.weekday),
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
    isoDate: `${parts.year}-${parts.month}-${parts.day}`,
  };
}

/** 720 → "12pm", 1350 → "10.30pm", 1440 → "12am". */
export function formatClock(minutes: number): string {
  const m = ((minutes % 1440) + 1440) % 1440;
  const hour = Math.floor(m / 60);
  const minute = m % 60;
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}${minute ? `.${String(minute).padStart(2, '0')}` : ''}${hour < 12 ? 'am' : 'pm'}`;
}

/** 1170 → "19:30", as booking systems show it. */
export function formatSlot(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

export const kitchenClose = (dayIndex: number) => venue.hours[dayIndex].close - venue.kitchenLastOrdersBeforeClose;

export type StatusKind = 'open' | 'closing-soon' | 'bar-only' | 'closed';

export interface VenueStatus {
  kind: StatusKind;
  isOpen: boolean;
  label: string;
}

export function venueStatus(time: LondonTime): VenueStatus {
  const today = venue.hours[time.dayIndex];
  const lastOrders = kitchenClose(time.dayIndex);

  if (time.minutes < today.open) {
    return { kind: 'closed', isOpen: false, label: `Opens today at ${formatClock(today.open)}` };
  }
  if (time.minutes >= today.close) {
    const tomorrow = venue.hours[(time.dayIndex + 1) % 7];
    return { kind: 'closed', isOpen: false, label: `Closed · opens tomorrow at ${formatClock(tomorrow.open)}` };
  }
  if (time.minutes >= lastOrders) {
    return { kind: 'bar-only', isOpen: true, label: `Open until ${formatClock(today.close)} · kitchen closed` };
  }
  if (time.minutes >= lastOrders - venue.kitchenClosingSoonWindow) {
    return {
      kind: 'closing-soon',
      isOpen: true,
      label: `Kitchen closing soon · last orders ${formatClock(lastOrders)}`,
    };
  }
  return { kind: 'open', isOpen: true, label: `Open now · kitchen until ${formatClock(lastOrders)}` };
}

/** Bookable start times for a day, in minutes after midnight. */
export function bookingSlots(dayIndex: number): number[] {
  const { booking } = venue;
  const last = booking.lateDays.includes(venue.hours[dayIndex].key) ? booking.lastSlotLate : booking.lastSlot;
  const slots: number[] = [];
  for (let m = booking.firstSlot; m <= last; m += booking.slotStep) slots.push(m);
  return slots;
}

export interface CalendarDay {
  isoDate: string;
  dayIndex: number;
  weekday: string;
  dayOfMonth: number;
  month: string;
  /** e.g. "Friday 16 October" */
  long: string;
  relative?: 'Today' | 'Tomorrow';
}

const utcFormat = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', ...options });
const weekdayShort = utcFormat({ weekday: 'short' });
const monthShort = utcFormat({ month: 'short' });
const longDate = utcFormat({ weekday: 'long', day: 'numeric', month: 'long' });

/** The next `count` calendar days in London, starting today. */
export function upcomingDays(today: LondonTime, count: number): CalendarDay[] {
  const [y, m, d] = today.isoDate.split('-').map(Number);
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(Date.UTC(y, m - 1, d + i));
    return {
      isoDate: date.toISOString().slice(0, 10),
      dayIndex: (date.getUTCDay() + 6) % 7,
      weekday: weekdayShort.format(date),
      dayOfMonth: date.getUTCDate(),
      month: monthShort.format(date),
      long: longDate.format(date),
      relative: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : undefined,
    };
  });
}

/** Slots still in the future for the given day (all of them for days after today). */
export function availableSlots(day: CalendarDay, now: LondonTime): number[] {
  const slots = bookingSlots(day.dayIndex);
  return day.isoDate === now.isoDate ? slots.filter((slot) => slot > now.minutes) : slots;
}

export interface HoursRange {
  days: string;
  hours: string;
}

/** Consecutive days with the same hours, e.g. "Mon–Thu 12pm–11pm". */
export function groupedHours(): HoursRange[] {
  const ranges: { from: number; to: number; open: number; close: number }[] = [];
  venue.hours.forEach((day, i) => {
    const last = ranges.at(-1);
    if (last && last.open === day.open && last.close === day.close) last.to = i;
    else ranges.push({ from: i, to: i, open: day.open, close: day.close });
  });
  return ranges.map(({ from, to, open, close }) => ({
    days: from === to ? WEEKDAYS[from] : `${WEEKDAYS[from]}–${WEEKDAYS[to]}`,
    hours: `${formatClock(open)}–${formatClock(close)}`,
  }));
}
