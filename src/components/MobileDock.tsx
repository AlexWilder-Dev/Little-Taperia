import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useEffect, useState } from 'react';
import { formatMoney } from '../lib/format';
import { spring } from '../lib/motion';
import { usePlan } from '../lib/plan';
import { Icon } from './ui/Icon';
import './MobileDock.css';

/** Sticky bottom bar on small screens: "Book a table", plus the table plan once it has plates. */
export function MobileDock() {
  const { plates, total, setOpen } = usePlan();
  const { scrollY } = useScroll();
  const [pastHero, setPastHero] = useState(false);
  const [bookingVisible, setBookingVisible] = useState(false);

  useMotionValueEvent(scrollY, 'change', (y) => setPastHero(y > window.innerHeight * 0.7));

  useEffect(() => {
    const target = document.getElementById('book');
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => setBookingVisible(entry.isIntersecting), {
      rootMargin: '0px 0px -30% 0px',
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const showBook = pastHero && !bookingVisible;
  const showPlan = plates > 0;
  // Stays mounted under an open tray so focus can return to it
  const visible = showBook || showPlan;

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          className="dock"
          aria-label="Quick actions"
          initial={{ y: '120%' }}
          animate={{ y: 0 }}
          exit={{ y: '120%' }}
          transition={spring}
        >
          {showPlan && (
            <button type="button" className="dock__plan" onClick={() => setOpen(true)}>
              <span className="dock__count num">{plates}</span>
              <span className="dock__plan-text">
                Your table <span className="num">{formatMoney(total)}</span>
              </span>
            </button>
          )}
          {showBook && (
            <a href="#book" className="btn btn--primary dock__book">
              Book a table <Icon name="arrowRight" />
            </a>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
