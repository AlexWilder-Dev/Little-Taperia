export interface PressQuote {
  id: string;
  quote: string;
  source: string;
  /** Reviewer or context line, e.g. who wrote it or which dish it was about. */
  context?: string;
  stars?: number;
}

export interface Award {
  id: string;
  title: string;
  org: string;
  year?: number;
  /** Image id in the brand assets, when the badge image is available. */
  badge?: string;
}

export const quotes: PressQuote[] = [
  {
    id: 'time-out',
    quote: 'matches anything we’ve eaten on the Iberian peninsula',
    source: 'Time Out',
    context: 'on the pan con tomate',
    stars: 4,
  },
  {
    id: 'independent',
    quote: 'the home of great tapas',
    source: 'The Independent',
    context: 'John Walsh',
    stars: 4,
  },
  {
    id: 'square-meal',
    quote: 'the shiny new pearl of SW17’s dining scene',
    source: 'Square Meal',
  },
  {
    id: 'huffpost',
    quote: 'buzzing atmosphere and incredibly friendly staff',
    source: 'HuffPost UK',
    context: 'London’s best tapas',
  },
];

export const awards: Award[] = [
  {
    id: 'love-london-2016',
    title: 'Love London Award winner',
    org: 'Time Out',
    year: 2016,
    badge: 'badge-love-london-2016',
  },
  { id: 'time-out-stars', title: '★★★★ review', org: 'Time Out' },
  { id: 'independent-stars', title: '★★★★ review', org: 'The Independent' },
];

/** Additional badge image with no stated award text. */
export const extraBadges = [{ id: 'badge-sticker-2017', alt: '2017 award sticker' }];

export const mentions: string[] = [
  'Featured in Time Out’s and Hot Dinners’ best London tapas round-ups',
  'Listed in Harden’s',
];
