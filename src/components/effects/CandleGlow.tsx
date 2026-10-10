import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import './CandleGlow.css';

/**
 * A slow, warm pool of light fixed behind the page. It drifts toward the
 * cursor on desktop and wanders with scroll everywhere.
 */
export function CandleGlow() {
  const reduced = useReducedMotion();
  const pointerX = useMotionValue(0.62);
  const pointerY = useMotionValue(0.3);
  const x = useSpring(pointerX, { stiffness: 18, damping: 14, mass: 1.6 });
  const y = useSpring(pointerY, { stiffness: 18, damping: 14, mass: 1.6 });
  const { scrollYProgress } = useScroll();

  // A second, deeper glow that wanders as the page scrolls
  const wanderX = useTransform(scrollYProgress, (p) => `${(50 + Math.sin(p * Math.PI * 5) * 32).toFixed(2)}vw`);
  const wanderY = useTransform(scrollYProgress, (p) => `${(55 + Math.cos(p * Math.PI * 3) * 22).toFixed(2)}vh`);
  const leadX = useTransform(x, (v) => `${(v * 100).toFixed(2)}vw`);
  const leadY = useTransform(y, (v) => `${(v * 100).toFixed(2)}vh`);

  useEffect(() => {
    if (reduced) return;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      pointerX.set(event.clientX / window.innerWidth);
      pointerY.set(event.clientY / window.innerHeight);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduced, pointerX, pointerY]);

  return (
    <div className="candle-glow" aria-hidden="true">
      <motion.div className="candle-glow__lead" style={reduced ? undefined : { left: 0, top: 0, x: leadX, y: leadY }} />
      <motion.div
        className="candle-glow__wander"
        style={reduced ? undefined : { left: 0, top: 0, x: wanderX, y: wanderY }}
      />
    </div>
  );
}
