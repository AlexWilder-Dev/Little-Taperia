import { motion, type HTMLMotionProps } from 'framer-motion';
import { softSpring } from '../../lib/motion';

interface RevealProps extends HTMLMotionProps<'div'> {
  delay?: number;
  /** Vertical travel in px. */
  y?: number;
}

/** Fades and springs content up as it scrolls into view. */
export function Reveal({ delay = 0, y = 32, children, ...props }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ ...softSpring, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
