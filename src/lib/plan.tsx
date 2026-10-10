import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { menuItems, type PlannableItem } from '../data/menu';
import { venue } from '../data/venue';
import { plural, roundPence } from './format';

export interface PlanLine {
  item: PlannableItem;
  qty: number;
  total: number;
}

interface PlanValue {
  lines: PlanLine[];
  quantities: Record<string, number>;
  plates: number;
  subtotal: number;
  service: number;
  total: number;
  guests: number;
  suggestedPlates: number;
  setGuests: (guests: number) => void;
  add: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  /** Latest change, for the screen-reader live region. */
  announcement: string;
}

const PlanContext = createContext<PlanValue | null>(null);

const STORAGE_KEY = 'taperia-table-plan';
export const MIN_GUESTS = 1;
export const MAX_GUESTS = 20;

interface Stored {
  quantities: Record<string, number>;
  guests: number;
}

function load(): Stored {
  const fallback: Stored = { quantities: {}, guests: 2 };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Stored>;
    const quantities = Object.fromEntries(
      Object.entries(parsed.quantities ?? {}).filter(([id, qty]) => menuItems[id] && Number.isInteger(qty) && qty > 0),
    );
    const guests = Number.isInteger(parsed.guests) ? Math.min(MAX_GUESTS, Math.max(MIN_GUESTS, parsed.guests!)) : 2;
    return { quantities, guests };
  } catch {
    return fallback;
  }
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Stored>(load);
  const [isOpen, setOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage can be unavailable (private mode); the planner still works for this visit.
    }
  }, [state]);

  // Mirrors the latest state so rapid clicks build on each other without impure updaters.
  const stateRef = useRef(state);
  stateRef.current = state;

  const commit = useCallback((next: Stored) => {
    stateRef.current = next;
    setState(next);
  }, []);
  const change = useCallback(
    (id: string, delta: number) => {
      const item = menuItems[id];
      if (!item) return;
      const prev = stateRef.current;
      const qty = Math.max(0, (prev.quantities[id] ?? 0) + delta);
      const quantities = { ...prev.quantities };
      if (qty === 0) delete quantities[id];
      else quantities[id] = qty;
      commit({ ...prev, quantities });
      const plates = Object.values(quantities).reduce((sum, n) => sum + n, 0);
      setAnnouncement(`${delta > 0 ? 'Added' : 'Removed'} ${item.name}. ${plural(plates, 'plate')} on your table.`);
    },
    [commit],
  );

  const add = useCallback((id: string) => change(id, 1), [change]);
  const remove = useCallback((id: string) => change(id, -1), [change]);
  const clear = useCallback(() => {
    commit({ ...stateRef.current, quantities: {} });
    setAnnouncement('Table plan cleared.');
  }, [commit]);
  const setGuests = useCallback(
    (guests: number) => commit({ ...stateRef.current, guests: Math.min(MAX_GUESTS, Math.max(MIN_GUESTS, guests)) }),
    [commit],
  );

  const value = useMemo<PlanValue>(() => {
    const lines = Object.entries(state.quantities).map(([id, qty]) => ({
      item: menuItems[id],
      qty,
      total: roundPence(menuItems[id].price * qty),
    }));
    const plates = lines.reduce((sum, line) => sum + line.qty, 0);
    const subtotal = roundPence(lines.reduce((sum, line) => sum + line.total, 0));
    const service = roundPence(subtotal * venue.serviceCharge);
    return {
      lines,
      quantities: state.quantities,
      plates,
      subtotal,
      service,
      total: roundPence(subtotal + service),
      guests: state.guests,
      suggestedPlates: state.guests * venue.booking.platesPerPerson,
      setGuests,
      add,
      remove,
      clear,
      isOpen,
      setOpen,
      announcement,
    };
  }, [state, isOpen, announcement, add, remove, clear, setGuests]);

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanValue {
  const value = useContext(PlanContext);
  if (!value) throw new Error('usePlan must be used inside PlanProvider');
  return value;
}
