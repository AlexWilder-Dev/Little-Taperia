import { motion, type HTMLMotionProps } from 'framer-motion';
import { softSpring } from '../../lib/motion';

interface RevealProps extends HTMLMotionProps<'div'> {
  delay?: number;
  /** Vertical travel in px. */
  y?: number;
  as?: 'div' | 'li';
}

/** Fades and springs content up as it scrolls into view. */
export function Reveal({ delay = 0, y = 20, as = 'div', children, ...props }: RevealProps) {
  const Component = (as === 'li' ? motion.li : motion.div) as typeof motion.div;
  return (
    <Component
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ ...softSpring, delay }}
      {...props}
    >
      {children}
    </Component>
  );
}
