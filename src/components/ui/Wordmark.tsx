import type { CSSProperties } from 'react';
import { brandUrl, getBrand } from '../../lib/images';
import './Wordmark.css';

/**
 * The venue's logo, recoloured in marble cream when a transparent logo file
 * is available, otherwise a typographic lockup.
 */
export function Wordmark({ size = 'small', as: Tag = 'span' }: { size?: 'small' | 'hero'; as?: 'span' | 'h1' }) {
  const logo = getBrand('logo');

  if (logo?.maskable) {
    const url = `url(${brandUrl(logo.file)})`;
    return (
      <Tag className={`wordmark wordmark--logo wordmark--${size}`}>
        <span
          className="wordmark__logo"
          role="img"
          aria-label="The Little Taperia"
          style={{ aspectRatio: `${logo.w} / ${logo.h}`, maskImage: url, WebkitMaskImage: url } as CSSProperties}
        />
      </Tag>
    );
  }

  return (
    <Tag className={`wordmark wordmark--type wordmark--${size}`}>
      <span className="wordmark__small">The Little</span> <span className="wordmark__big">Taperia</span>
    </Tag>
  );
}
