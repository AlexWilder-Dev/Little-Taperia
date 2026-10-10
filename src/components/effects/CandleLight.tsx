import { useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface CandleLightProps {
  /** Scales the number of lights. */
  density?: number;
  /** Scales their brightness. */
  intensity?: number;
  /** How far the lights shift with the cursor, in px at full depth. */
  parallax?: number;
  className?: string;
}

type RGB = [number, number, number];

const PALETTE: RGB[] = [
  [238, 178, 94], // amber
  [249, 220, 166], // pale candle
  [224, 153, 61], // saffron
  [164, 70, 42], // sherry
];

function discSprite([r, g, b]: RGB): HTMLCanvasElement {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, `rgba(${r},${g},${b},0.5)`);
  gradient.addColorStop(0.72, `rgba(${r},${g},${b},0.42)`);
  gradient.addColorStop(0.88, `rgba(${r},${g},${b},0.22)`);
  gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

function emberSprite(): HTMLCanvasElement {
  const size = 32;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,236,200,1)');
  gradient.addColorStop(0.25, 'rgba(245,190,110,0.7)');
  gradient.addColorStop(1, 'rgba(224,153,61,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

interface Bokeh {
  x: number;
  y: number;
  r: number;
  depth: number;
  alpha: number;
  phase: number;
  speed: number;
  drift: number;
  sprite: HTMLCanvasElement;
}

interface Ember {
  x: number;
  y: number;
  r: number;
  rise: number;
  sway: number;
  phase: number;
  alpha: number;
}

/**
 * Out-of-focus candle lights and drifting embers, drawn to a canvas. Pauses
 * off-screen and when the tab is hidden; draws a single still frame for
 * reduced motion.
 */
export function CandleLight({ density = 1, intensity = 1, parallax = 28, className = '' }: CandleLightProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const sprites = PALETTE.map(discSprite);
    const ember = emberSprite();
    let width = 0;
    let height = 0;
    let bokeh: Bokeh[] = [];
    let embers: Ember[] = [];
    let raf = 0;
    let last = 0;
    let visible = true;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

    const seed = () => {
      const area = Math.min(1.6, (width * height) / (1440 * 900));
      const bokehCount = Math.round(26 * density * Math.max(0.45, area));
      const emberCount = Math.round(30 * density * Math.max(0.4, area));
      bokeh = Array.from({ length: bokehCount }, () => {
        const depth = Math.random();
        return {
          x: Math.random(),
          y: Math.pow(Math.random(), 1.4) * 0.85,
          r: 14 + depth * depth * 70,
          depth,
          alpha: (0.1 + Math.random() * 0.3) * intensity,
          phase: Math.random() * Math.PI * 2,
          speed: 0.15 + Math.random() * 0.5,
          drift: (Math.random() - 0.5) * 0.004,
          sprite: sprites[Math.floor(Math.random() * sprites.length)],
        };
      });
      embers = Array.from({ length: emberCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.8 + Math.random() * 1.8,
        rise: 6 + Math.random() * 20,
        sway: 6 + Math.random() * 16,
        phase: Math.random() * Math.PI * 2,
        alpha: (0.3 + Math.random() * 0.6) * intensity,
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const draw = (time: number) => {
      const dt = last ? Math.min(0.05, (time - last) / 1000) : 0;
      last = time;
      const t = time / 1000;
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      for (const light of bokeh) {
        light.x += light.drift * dt;
        if (light.x < -0.1) light.x = 1.1;
        if (light.x > 1.1) light.x = -0.1;
        const flicker = 0.75 + 0.25 * Math.sin(t * light.speed + light.phase);
        const px = light.x * width + pointer.x * parallax * light.depth;
        const py = light.y * height + pointer.y * parallax * 0.6 * light.depth;
        ctx.globalAlpha = light.alpha * flicker;
        ctx.drawImage(light.sprite, px - light.r, py - light.r, light.r * 2, light.r * 2);
      }

      for (const e of embers) {
        e.y -= e.rise * dt;
        if (e.y < -10) {
          e.y = height + 10;
          e.x = Math.random() * width;
        }
        const x = e.x + Math.sin(t * 0.6 + e.phase) * e.sway;
        const fade = Math.min(1, e.y / (height * 0.35));
        ctx.globalAlpha = e.alpha * fade * (0.6 + 0.4 * Math.sin(t * 3 + e.phase));
        const size = e.r * 5;
        ctx.drawImage(ember, x - size / 2, e.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
    };

    const loop = (time: number) => {
      draw(time);
      raf = visible && !document.hidden ? requestAnimationFrame(loop) : 0;
    };

    const start = () => {
      if (reduced || raf) return;
      last = 0;
      raf = requestAnimationFrame(loop);
    };

    resize();
    if (reduced) draw(4000);
    else start();

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reduced) draw(4000);
    });
    resizeObserver.observe(canvas);

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    intersection.observe(canvas);

    const onVisibility = () => !document.hidden && visible && start();
    document.addEventListener('visibilitychange', onVisibility);

    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      pointer.tx = event.clientX / window.innerWidth - 0.5;
      pointer.ty = event.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointer);
    };
  }, [density, intensity, parallax, reduced]);

  return <canvas ref={ref} className={`candle-light ${className}`} aria-hidden="true" />;
}
