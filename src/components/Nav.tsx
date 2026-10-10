import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { venue } from '../data/venue';
import { hasGallery } from '../lib/images';
import { useDialog } from '../lib/useDialog';
import { HoursBadge } from './ui/HoursBadge';
import { Icon } from './ui/Icon';
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
].filter((link) => link.id !== 'gallery' || hasGallery);

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

// 'top' clears the highlight while the hero is in view
const sectionIds = ['top', ...navLinks.map((link) => link.id)];

export function Nav() {
  const [open, setOpen] = useState(false);
  const active = useActiveSection(sectionIds);
  const panelRef = useRef<HTMLDivElement>(null);

  useDialog(open, panelRef, () => setOpen(false));

  return (
    <header className="nav">
      <div className="nav__inner container">
        <a href="#top" className="nav__brand">
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
          <a href="#book" className="btn btn--primary btn--small nav__cta">
            Book a table
          </a>
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
                  {navLinks.map((link) => (
                    <li key={link.id}>
                      <a href={`#${link.id}`} className="mobile-menu__link display" onClick={() => setOpen(false)}>
                        {link.label}
                      </a>
                    </li>
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
