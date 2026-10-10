import { describe, expect, it } from 'vitest';
import {
  availableSlots,
  bookingSlots,
  formatClock,
  formatSlot,
  groupedHours,
  londonTime,
  upcomingDays,
  venueStatus,
  type LondonTime,
} from './hours';

const at = (dayIndex: number, hh: number, mm = 0): LondonTime => ({
  dayIndex,
  minutes: hh * 60 + mm,
  isoDate: '2026-10-12',
});

describe('londonTime', () => {
  it('applies British Summer Time', () => {
    // Wednesday 1 July 2026, 11:30 UTC = 12:30 BST
    expect(londonTime(new Date('2026-07-01T11:30:00Z'))).toEqual({ dayIndex: 2, minutes: 750, isoDate: '2026-07-01' });
  });

  it('uses GMT in winter and rolls the date at local midnight', () => {
    // Saturday 9 January 2027, 23:59 UTC = 23:59 GMT
    expect(londonTime(new Date('2027-01-09T23:59:00Z'))).toEqual({ dayIndex: 5, minutes: 1439, isoDate: '2027-01-09' });
    // Friday 31 July 2026, 23:30 UTC = Saturday 00:30 BST
    expect(londonTime(new Date('2026-07-31T23:30:00Z'))).toMatchObject({ dayIndex: 5, minutes: 30 });
  });
});

describe('formatClock', () => {
  it('formats in the British style', () => {
    expect(formatClock(720)).toBe('12pm');
    expect(formatClock(1320)).toBe('10pm');
    expect(formatClock(1350)).toBe('10.30pm');
    expect(formatClock(1440)).toBe('12am');
    expect(formatSlot(1170)).toBe('19:30');
  });
});

describe('venueStatus', () => {
  it('is closed before opening', () => {
    expect(venueStatus(at(0, 11, 30))).toMatchObject({ kind: 'closed', label: 'Opens today at 12pm' });
  });

  it('is open with the kitchen time on a weekday', () => {
    expect(venueStatus(at(1, 19))).toMatchObject({ kind: 'open', label: 'Open now · kitchen until 10pm' });
  });

  it('warns when the kitchen is about to close', () => {
    expect(venueStatus(at(2, 21, 20))).toMatchObject({
      kind: 'closing-soon',
      label: 'Kitchen closing soon · last orders 10pm',
    });
  });

  it('keeps the bar open after last food orders', () => {
    expect(venueStatus(at(3, 22, 15))).toMatchObject({
      kind: 'bar-only',
      isOpen: true,
      label: 'Open until 11pm · kitchen closed',
    });
  });

  it('stays open until midnight on Fridays and Saturdays', () => {
    expect(venueStatus(at(4, 21, 30))).toMatchObject({ kind: 'open', label: 'Open now · kitchen until 11pm' });
    expect(venueStatus(at(5, 23, 30))).toMatchObject({ kind: 'bar-only', label: 'Open until 12am · kitchen closed' });
  });

  it('points to tomorrow after closing', () => {
    expect(venueStatus(at(6, 23, 5))).toMatchObject({ kind: 'closed', label: 'Closed · opens tomorrow at 12pm' });
  });
});

describe('booking slots', () => {
  it('runs 12:00–21:30 most days and to 22:30 on Friday and Saturday', () => {
    const monday = bookingSlots(0);
    expect(formatSlot(monday[0])).toBe('12:00');
    expect(formatSlot(monday[monday.length - 1])).toBe('21:30');
    expect(monday).toHaveLength(20);
    const friday = bookingSlots(4);
    expect(formatSlot(friday[friday.length - 1])).toBe('22:30');
    expect(friday).toHaveLength(22);
    expect(formatSlot(bookingSlots(6).at(-1)!)).toBe('21:30');
  });

  it('hides times that have already passed today', () => {
    const now = { dayIndex: 0, minutes: 19 * 60 + 10, isoDate: '2026-10-12' };
    const [today, tomorrow] = upcomingDays(now, 2);
    expect(today).toMatchObject({ relative: 'Today', dayIndex: 0 });
    expect(availableSlots(today, now).map(formatSlot)).toEqual(['19:30', '20:00', '20:30', '21:00', '21:30']);
    expect(availableSlots(tomorrow, now)).toHaveLength(20);
  });

  it('builds calendar days across a month end', () => {
    const days = upcomingDays({ dayIndex: 5, minutes: 600, isoDate: '2026-10-31' }, 3);
    expect(days.map((d) => d.isoDate)).toEqual(['2026-10-31', '2026-11-01', '2026-11-02']);
    expect(days.map((d) => d.dayIndex)).toEqual([5, 6, 0]);
    expect(days[2].long).toBe('Monday 2 November');
  });
});

describe('groupedHours', () => {
  it('summarises the week', () => {
    expect(groupedHours()).toEqual([
      { days: 'Mon–Thu', hours: '12pm–11pm' },
      { days: 'Fri–Sat', hours: '12pm–12am' },
      { days: 'Sun', hours: '12pm–11pm' },
    ]);
  });
});
