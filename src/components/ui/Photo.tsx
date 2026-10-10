import { useState, type CSSProperties } from 'react';
import { photoUrl, srcSet, type ImageEntry } from '../../lib/images';
import './Photo.css';

interface PhotoProps {
  image: ImageEntry;
  /** The `sizes` attribute: how wide the photo renders at each breakpoint. */
  sizes: string;
  alt?: string;
  /** Load immediately (above the fold) instead of lazily. */
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  style?: CSSProperties;
  /** Show the photo no larger than its original pixels. */
  noUpscale?: boolean;
}

/** A processed venue photo: AVIF with WebP fallback, blur-up preview and film grain. */
export function Photo({
  image,
  sizes,
  alt,
  priority,
  className = '',
  imgClassName = '',
  style,
  noUpscale,
}: PhotoProps) {
  const [loaded, setLoaded] = useState(false);
  const fallbackWidth = image.widths.filter((w) => w <= 1080).at(-1) ?? image.widths[0];

  return (
    <div
      className={`photo ${loaded ? 'is-loaded' : ''} ${className}`}
      style={{
        backgroundColor: image.color,
        backgroundImage: `url(${image.lqip})`,
        ...(noUpscale ? { maxWidth: image.w } : null),
        ...style,
      }}
    >
      <picture>
        <source type="image/avif" srcSet={srcSet(image, 'avif')} sizes={sizes} />
        <source type="image/webp" srcSet={srcSet(image, 'webp')} sizes={sizes} />
        <img
          className={`photo__img ${imgClassName}`}
          src={photoUrl(image.id, fallbackWidth, 'webp')}
          width={image.w}
          height={image.h}
          alt={alt ?? image.alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setLoaded(true)}
        />
      </picture>
    </div>
  );
}
