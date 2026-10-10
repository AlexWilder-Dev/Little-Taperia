import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

/** Renders dialogs straight into <body>, outside the app root that goes inert behind them. */
export function Portal({ children }: { children: ReactNode }) {
  return createPortal(children, document.body);
}
