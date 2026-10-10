import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { ImageEntry } from '../lib/images';
import { softSpring } from '../lib/motion';
import { useDialog } from '../lib/useDialog';
import { Icon } from './ui/Icon';
import { Photo } from './ui/Photo';
import { Portal } from './ui/Portal';
import './Lightbox.css';

interface LightboxProps {
  photos: ImageEntry[];
  index: number | null;
  onIndex: (index: number | null) => void;
}

const variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 80 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction * -80 }),
};

export function Lightbox({ photos, index, onIndex }: LightboxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [direction, setDirection] = useState(0);
  const open = index !== null && photos.length > 0;
  const close = () => onIndex(null);
  useDialog(open, ref, close);

  const go = (delta: number) => {
    if (index === null) return;
    setDirection(delta);
    onIndex((index + delta + photos.length) % photos.length);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') go(1);
      if (event.key === 'ArrowLeft') go(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -70 || info.velocity.x < -500) go(1);
    else if (info.offset.x > 70 || info.velocity.x > 500) go(-1);
  };

  const photo = index !== null ? photos[index] : null;

  return (
    <Portal>
      <AnimatePresence>
        {open && photo && (
          <motion.div
            ref={ref}
            className="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
            tabIndex={-1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="lightbox__bar">
              <p className="lightbox__count num" aria-live="polite">
                {index! + 1} / {photos.length}
              </p>
              <button type="button" className="icon-btn" onClick={close} aria-label="Close photo viewer" data-autofocus>
                <Icon name="close" />
              </button>
            </div>

            <div className="lightbox__stage">
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.figure
                  key={photo.id}
                  className="lightbox__figure"
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={softSpring}
                  drag={photos.length > 1 ? 'x' : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.5}
                  onDragEnd={onDragEnd}
                >
                  <Photo
                    image={photo}
                    sizes="90vw"
                    className="lightbox__photo"
                    noUpscale
                    style={{ aspectRatio: `${photo.w} / ${photo.h}`, '--ratio': photo.w / photo.h } as CSSProperties}
                  />
                  <figcaption>{photo.alt}</figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>

            {photos.length > 1 && (
              <div className="lightbox__nav">
                <button type="button" className="icon-btn" onClick={() => go(-1)} aria-label="Previous photo">
                  <Icon name="arrowLeft" />
                </button>
                <button type="button" className="icon-btn" onClick={() => go(1)} aria-label="Next photo">
                  <Icon name="arrowRight" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
