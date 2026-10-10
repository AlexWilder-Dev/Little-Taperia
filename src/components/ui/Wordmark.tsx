import './Wordmark.css';

/**
 * The venue's wordmark, set in IM Fell English Italic to match their gold
 * logo (the logo file itself is only 400×70, too small to scale up).
 */
export function Wordmark({
  size = 'small',
  tone = 'ink',
  as: Tag = 'span',
}: {
  size?: 'small' | 'large';
  tone?: 'ink' | 'gold';
  as?: 'span' | 'p';
}) {
  return <Tag className={`wordmark wordmark--${size} wordmark--${tone}`}>The Little Tapería</Tag>;
}
