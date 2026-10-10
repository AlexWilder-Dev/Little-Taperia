import type { Transition } from 'framer-motion';

/** The house spring: settles quickly with a little give. */
export const spring: Transition = { type: 'spring', stiffness: 170, damping: 26, mass: 0.9 };

/** Softer spring for large, slow elements such as images and panels. */
export const softSpring: Transition = { type: 'spring', stiffness: 90, damping: 22, mass: 1 };

export const snappy: Transition = { type: 'spring', stiffness: 420, damping: 32 };
