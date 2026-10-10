import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useEffect, useState } from 'react';
import { venue } from '../data/venue';
import { spring } from '../lib/motion';
import { Icon } from './ui/Icon';
import './MobileDock.css';

/** Sticky "Book a table" bar on small screens, once the hero has scrolled away. */
export function MobileDock() {
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

  return (
    <AnimatePresence>
      {pastHero && !bookingVisible && (
        <motion.aside
          className="dock"
          aria-label="Quick actions"
          initial={{ y: '120%' }}
          animate={{ y: 0 }}
          exit={{ y: '120%' }}
          transition={spring}
        >
          <a href={`tel:${venue.phone.tel}`} className="dock__call">
            <Icon name="phone" />
            <span className="visually-hidden">Call {venue.phone.display}</span>
          </a>
          <a href="#book" className="btn btn--primary dock__book">
            Book a table <Icon name="arrowRight" />
          </a>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
