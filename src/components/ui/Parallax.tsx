import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import './Parallax.css';

/** Drifts its contents slightly against the scroll, inside a clipped frame. */
export function Parallax({
  children,
  amount = 7,
  className = '',
}: {
  children: ReactNode;
  amount?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${amount}%`, `${amount}%`]);

  return (
    <div ref={ref} className={`parallax ${className}`}>
      <motion.div className="parallax__inner" style={reduced ? undefined : { y, scale: 1 + (amount * 2.2) / 100 }}>
        {children}
      </motion.div>
    </div>
  );
}
