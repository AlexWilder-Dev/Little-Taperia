import type { CSSProperties, ReactNode } from 'react';
import './Placeholder.css';

/** Small deterministic hash so each placeholder gets its own lighting. */
function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967295;
}

interface PlaceholderProps {
  /** What the photo will show. */
  label: string;
  /** Expected source file(s). */
  files: string[];
  seed?: string;
  /** Artwork to show inside the frame. Without it the frame gets a lit gradient. */
  children?: ReactNode;
  className?: string;
  /** Compact tag for tight spaces. */
  compact?: boolean;
}

/**
 * Stands in for a photo that couldn't be downloaded. It is clearly labelled so
 * nobody mistakes it for finished imagery; run `npm run images` to fill it.
 */
export function PhotoPlaceholder({ label, files, seed = label, children, className = '', compact }: PlaceholderProps) {
  const r = hash(seed);
  const style = {
    '--ph-x': `${20 + r * 60}%`,
    '--ph-y': `${25 + ((r * 7) % 1) * 45}%`,
    '--ph-hue': `${Math.round(r * 24)}deg`,
  } as CSSProperties;

  return (
    <div className={`placeholder ${children ? 'placeholder--art' : ''} ${className}`} style={style}>
      {children}
      <span className="placeholder__marks" aria-hidden="true" />
      <span className={`placeholder__tag ${compact ? 'placeholder__tag--compact' : ''}`}>
        <span className="placeholder__kind">Photo placeholder</span>
        <span className="placeholder__label">{label}</span>
        {!compact && <span className="placeholder__file">{files.join(' · ')}</span>}
      </span>
    </div>
  );
}
