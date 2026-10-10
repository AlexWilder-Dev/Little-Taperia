import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useRef, useState } from 'react';
import { venue } from '../data/venue';
import { hasGallery } from '../lib/images';
import { useActiveSection } from '../lib/useActiveSection';
import { useDialog } from '../lib/useDialog';
import { HoursBadge } from './ui/HoursBadge';
import { Icon } from './ui/Icon';
import { Portal } from './ui/Portal';
import { Wordmark } from './ui/Wordmark';
import './Nav.css';

export const navLinks = [
  { id: 'menu', label: 'Menu' },
  { id: 'drinks', label: 'Drinks' },
  { id: 'story', label: 'Our story' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'private-hire', label: 'Private hire' },
  { id: 'visit', label: 'Find us' },
].filter((link) => link.id !== 'gallery' || hasGallery);

// Sections without a nav link clear the highlight while they're in view
const sectionIds = ['top', 'welcome', 'book', ...navLinks.map((link) => link.id)];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const active = useActiveSection(sectionIds);
  const panelRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 48));
  useDialog(open, panelRef, () => setOpen(false));

  return (
    <>
      <aside className="utility" aria-label="Address and phone">
        <div className="container utility__inner">
          <p className="utility__where">
            {venue.address.street}, {venue.address.locality} {venue.address.postcode}
            <span className="utility__note"> · {venue.address.directionsNote}</span>
          </p>
          <p className="utility__contact">
            <a href={`tel:${venue.phone.tel}`}>{venue.phone.display}</a>
          </p>
        </div>
      </aside>

      <header className={`masthead ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="masthead__inner container">
          <a href="#top" className="masthead__brand">
            <Wordmark />
          </a>

          <nav className="masthead__nav" aria-label="Sections">
            <ul role="list">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    className={`masthead__link ${active === link.id ? 'is-active' : ''}`}
                    aria-current={active === link.id ? 'location' : undefined}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="masthead__actions">
            <a href="#book" className="btn btn--primary btn--small masthead__cta">
              Book a table
            </a>
            <button
              type="button"
              className="masthead__toggle icon-btn"
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label="Open site navigation"
              onClick={() => setOpen(true)}
            >
              <Icon name="menu" />
            </button>
          </div>
        </div>
      </header>

      <Portal>
        <AnimatePresence>
          {open && (
            <motion.div
              ref={panelRef}
              id="site-menu"
              className="site-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              tabIndex={-1}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="site-menu__top container">
                <Wordmark />
                <button type="button" className="icon-btn" aria-label="Close navigation" onClick={() => setOpen(false)}>
                  <Icon name="close" />
                </button>
              </div>
              <nav className="site-menu__nav container" aria-label="Sections">
                <ul role="list">
                  {navLinks.map((link) => (
                    <li key={link.id}>
                      <a href={`#${link.id}`} className="site-menu__link display" onClick={() => setOpen(false)}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="site-menu__foot container">
                <a href="#book" className="btn btn--primary btn--block" onClick={() => setOpen(false)}>
                  Book a table <Icon name="arrowRight" />
                </a>
                <HoursBadge />
                <p>
                  {venue.address.street}, {venue.address.postcode}
                  <br />
                  <a href={`tel:${venue.phone.tel}`} className="text-link">
                    {venue.phone.display}
                  </a>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}
