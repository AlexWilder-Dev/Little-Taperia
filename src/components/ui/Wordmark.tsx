import type { CSSProperties } from 'react';
import { brandUrl, getBrand } from '../../lib/images';
import './Wordmark.css';

/** Smallest logo file that stays crisp at each size: height for the nav, width for the hero. */
const crisp = {
  small: (logo: { w: number; h: number }) => logo.h >= 64,
  hero: (logo: { w: number; h: number }) => logo.w >= 560,
};

/**
 * The venue's logo, recoloured in marble cream, when a transparent logo file
 * large enough for this size is available; otherwise a typographic lockup.
 */
export function Wordmark({ size = 'small', as: Tag = 'span' }: { size?: 'small' | 'hero'; as?: 'span' | 'h1' }) {
  const logo = getBrand('logo');

  if (logo?.maskable && crisp[size](logo)) {
    const url = `url(${brandUrl(logo.file)})`;
    return (
      <Tag className={`wordmark wordmark--logo wordmark--${size}`}>
        <span
          className="wordmark__logo"
          role="img"
          aria-label="The Little Taperia"
          style={
            {
              aspectRatio: `${logo.w} / ${logo.h}`,
              maxWidth: `${logo.w}px`,
              maskImage: url,
              WebkitMaskImage: url,
            } as CSSProperties
          }
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
