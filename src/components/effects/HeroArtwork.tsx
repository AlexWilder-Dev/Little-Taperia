import './HeroArtwork.css';

const candles = [
  { x: 6, scale: 0.55, delay: 0.4 },
  { x: 55, scale: 0.75, delay: 1.3 },
  { x: 70, scale: 1.05, delay: 0 },
  { x: 88, scale: 1.45, delay: 0.8 },
];

const arches = Array.from({ length: 7 }, (_, i) => i);

/**
 * After-dark scene for when no interior photo is strong enough: a back-bar
 * arcade, a marble counter and glass votives flickering on it.
 */
export function HeroArtwork() {
  return (
    <div className="hero-art" aria-hidden="true">
      <div className="hero-art__wall" />
      <svg className="hero-art__arches" viewBox="0 0 1400 700" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="arch-stroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f5c97e" stopOpacity="0.55" />
            <stop offset="1" stopColor="#f5c97e" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="arch-fill" cx="0.5" cy="0.15" r="0.9">
            <stop offset="0" stopColor="#e0993d" stopOpacity="0.16" />
            <stop offset="1" stopColor="#e0993d" stopOpacity="0" />
          </radialGradient>
        </defs>
        {arches.map((i) => {
          const x = 40 + i * 195;
          return (
            <path
              key={i}
              d={`M${x} 700 V250 a75 75 0 0 1 150 0 V700`}
              fill="url(#arch-fill)"
              stroke="url(#arch-stroke)"
              strokeWidth="1.2"
            />
          );
        })}
      </svg>
      <div className="hero-art__counter">
        <div className="hero-art__marble" />
        {candles.map((c) => (
          <span key={c.x} className="hero-art__reflection" style={{ left: `${c.x}%`, scale: String(c.scale) }} />
        ))}
      </div>
      {candles.map((c) => (
        <span
          key={c.x}
          className="votive"
          style={{ left: `${c.x}%`, bottom: `${30 - c.scale * 9}%`, scale: String(c.scale) }}
        >
          <span className="votive__halo" style={{ animationDelay: `${c.delay}s` }} />
          <span className="votive__flame" style={{ animationDelay: `${c.delay}s` }} />
          <span className="votive__glass" />
        </span>
      ))}
    </div>
  );
}
