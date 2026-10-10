import { venue } from '../../data/venue';
import './StoryArt.css';

/** The old shopfront as type: the pet shop sign fading out, the taperia glowing in. */
export function ShopfrontArt() {
  return (
    <div className="art art--shop" aria-hidden="true">
      <div className="art-shop__fascia">
        <span className="art-shop__ghost">Pet shop</span>
        <span className="art-shop__now display">Taperia</span>
      </div>
      <div className="art-shop__window">
        <span className="art-shop__glow" />
        <span className="art-shop__number display">143</span>
        <span className="art-shop__street">Tooting High Street</span>
      </div>
    </div>
  );
}

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('');

/** Two monogram medallions, overlapping. */
export function FoundersArt() {
  const [first, second] = venue.founders;
  return (
    <div className="art art--founders" aria-hidden="true">
      <div className="art-founders__rings">
        <span className="art-founders__ring art-founders__ring--a">
          <span className="display">{initials(second.name)}</span>
        </span>
        <span className="art-founders__amp display">&amp;</span>
        <span className="art-founders__ring art-founders__ring--b">
          <span className="display">{initials(first.name)}</span>
        </span>
      </div>
      <p className="art-founders__caption">Tooting, SW17</p>
    </div>
  );
}

/** The two rooms as a pair of arches: marble bar in front, kitchen fire behind. */
export function RoomsArt() {
  const [front, back] = venue.rooms;
  return (
    <div className="art art--rooms" aria-hidden="true">
      <div className="art-rooms__arch art-rooms__arch--front">
        <span className="art-rooms__fill marble" />
        <span className="art-rooms__label">
          <span className="display">{front.spanish}</span>
          <small>Front room</small>
        </span>
      </div>
      <div className="art-rooms__arch art-rooms__arch--back">
        <span className="art-rooms__fill art-rooms__fill--fire" />
        <span className="art-rooms__label">
          <span className="display">{back.spanish}</span>
          <small>Back room</small>
        </span>
      </div>
    </div>
  );
}
