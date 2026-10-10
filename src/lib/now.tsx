import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { londonTime, type LondonTime } from './hours';

const NowContext = createContext<LondonTime>(londonTime());

/** Shares the current London time, refreshed every 30 seconds and when the tab regains focus. */
export function NowProvider({ children }: { children: ReactNode }) {
  const [now, setNow] = useState(() => londonTime());

  useEffect(() => {
    const tick = () =>
      setNow((prev) => {
        const next = londonTime();
        return next.minutes === prev.minutes && next.isoDate === prev.isoDate ? prev : next;
      });
    const id = window.setInterval(tick, 30_000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, []);

  return <NowContext.Provider value={now}>{children}</NowContext.Provider>;
}

export const useLondonNow = () => useContext(NowContext);
