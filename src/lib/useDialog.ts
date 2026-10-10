import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

let locks = 0;

const appRoot = () => document.getElementById('root');

/** Locks page scroll and makes the app inert behind a dialog portalled to <body>. */
function lockPage() {
  if (locks++ === 0) {
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty('--scrollbar-gap', `${scrollbar}px`);
    document.documentElement.classList.add('is-locked');
    appRoot()?.setAttribute('inert', '');
  }
}

function unlockPage() {
  if (--locks === 0) {
    document.documentElement.classList.remove('is-locked');
    appRoot()?.removeAttribute('inert');
  }
}

/**
 * Modal behaviour for an open dialog: moves focus inside, keeps Tab within it,
 * closes on Escape, locks page scroll and restores focus when it closes.
 * Render the dialog through <Portal> so it stays outside the inert app root.
 */
export function useDialog(open: boolean, ref: RefObject<HTMLElement | null>, onClose: () => void) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const node = ref.current;
    if (!node) return;
    const previous = document.activeElement as HTMLElement | null;

    const focusables = () =>
      Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.getClientRects().length > 0);

    lockPage();
    const first = node.querySelector<HTMLElement>('[data-autofocus]') ?? focusables()[0] ?? node;
    first.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === firstItem || !node.contains(document.activeElement))) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      unlockPage();
      // The opener may have gone (e.g. the last plate was cleared); fall back to the main content
      const target = previous?.isConnected ? previous : document.getElementById('main');
      target?.focus({ preventScroll: true });
    };
  }, [open, ref]);
}
