import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { venue } from '../data/venue';
import { spring } from '../lib/motion';
import { useDialog } from '../lib/useDialog';
import { HoursBadge } from './ui/HoursBadge';
import { Icon } from './ui/Icon';
import { Magnetic } from './ui/Magnetic';
import { Portal } from './ui/Portal';
import { Wordmark } from './ui/Wordmark';
import './Nav.css';

export const navLinks = [
  { id: 'story', label: 'Story' },
  { id: 'menu', label: 'Menu' },
  { id: 'drinks', label: 'Drinks' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'book', label: 'Book' },
  { id: 'visit', label: 'Visit' },
];

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

const sectionIds = navLinks.map((link) => link.id);

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(sectionIds);
  const { scrollY } = useScroll();
  const panelRef = useRef<HTMLDivElement>(null);

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 40));
  useDialog(open, panelRef, () => setOpen(false));

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="nav__inner container">
        <a href="#top" className="nav__brand" aria-label="The Little Taperia, back to top">
          <Wordmark />
        </a>

        <nav className="nav__links" aria-label="Sections">
          <ul role="list">
            {navLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  className={`nav__link ${active === link.id ? 'is-active' : ''}`}
                  aria-current={active === link.id ? 'location' : undefined}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="nav__actions">
          <HoursBadge className="nav__badge" />
          <Magnetic className="nav__cta">
            <a href="#book" className="btn btn--primary btn--small">
              Book a table
            </a>
          </Magnetic>
          <button
            type="button"
            className="nav__toggle icon-btn"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Icon name="menu" />
          </button>
        </div>
      </div>

      <Portal>
        <AnimatePresence>
          {open && (
            <motion.div
              ref={panelRef}
              id="mobile-menu"
              className="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Site menu"
              tabIndex={-1}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mobile-menu__top container">
                <Wordmark />
                <button type="button" className="icon-btn" aria-label="Close menu" onClick={() => setOpen(false)}>
                  <Icon name="close" />
                </button>
              </div>
              <nav className="mobile-menu__nav container" aria-label="Sections">
                <ul role="list">
                  {navLinks.map((link, i) => (
                    <motion.li
                      key={link.id}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...spring, delay: 0.05 + i * 0.04 }}
                    >
                      <a href={`#${link.id}`} className="mobile-menu__link display" onClick={() => setOpen(false)}>
                        <span className="mobile-menu__index num">0{i + 1}</span>
                        {link.label}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </nav>
              <div className="mobile-menu__foot container">
                <HoursBadge />
                <p>
                  {venue.address.street}, {venue.address.postcode}
                </p>
                <a href={`tel:${venue.phone.tel}`} className="text-link">
                  {venue.phone.display}
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </header>
  );
}
