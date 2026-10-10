export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface OpeningDay {
  key: DayKey;
  name: string;
  /** schema.org day name, used in the JSON-LD */
  schemaDay: string;
  /** Minutes after midnight. A close of 1440 means midnight. */
  open: number;
  close: number;
}

export interface Founder {
  name: string;
  role: string;
  bio: string;
}

export interface Room {
  name: string;
  spanish: string;
  description: string;
}

const H = 60;

export const venue = {
  name: 'The Little Taperia',
  tagline: 'Spanish tapas, sherry & cocktails on Tooting High Street',
  description:
    'An independent tapas bar on Tooting High Street, bringing a little Iberian glamour to SW17: inventive tapas, really good ingredients and gorgeous surroundings to linger in.',
  website: 'https://www.thelittletaperia.co.uk/',

  address: {
    street: '143 Tooting High Street',
    locality: 'London',
    postcode: 'SW17 0SY',
    country: 'GB',
    directionsNote: 'Just past Tooting Broadway',
  },
  phone: { display: '020 8682 3303', tel: '+442086823303' },
  email: 'enquiries@thelittletaperia.co.uk',

  bookingUrl: 'https://booking.resdiary.com/widget/Standard/THELITTLETAPERIA1/17881',
  mapsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=' +
    encodeURIComponent('The Little Taperia, 143 Tooting High Street, London SW17 0SY'),

  socials: [
    { label: 'Instagram', handle: '@littletaperiatooting', url: 'https://www.instagram.com/littletaperiatooting/' },
    {
      label: 'Facebook',
      handle: 'The Little Taperia',
      url: 'https://www.facebook.com/The-Little-Taperia-1444667912507824/',
    },
  ],

  hours: [
    { key: 'mon', name: 'Monday', schemaDay: 'Monday', open: 12 * H, close: 23 * H },
    { key: 'tue', name: 'Tuesday', schemaDay: 'Tuesday', open: 12 * H, close: 23 * H },
    { key: 'wed', name: 'Wednesday', schemaDay: 'Wednesday', open: 12 * H, close: 23 * H },
    { key: 'thu', name: 'Thursday', schemaDay: 'Thursday', open: 12 * H, close: 23 * H },
    { key: 'fri', name: 'Friday', schemaDay: 'Friday', open: 12 * H, close: 24 * H },
    { key: 'sat', name: 'Saturday', schemaDay: 'Saturday', open: 12 * H, close: 24 * H },
    { key: 'sun', name: 'Sunday', schemaDay: 'Sunday', open: 12 * H, close: 23 * H },
  ] satisfies OpeningDay[],
  /** Last food orders are taken this many minutes before closing. */
  kitchenLastOrdersBeforeClose: 60,
  /** The badge switches to "closing soon" this many minutes before last orders. */
  kitchenClosingSoonWindow: 45,

  booking: {
    firstSlot: 12 * H,
    lastSlot: 21 * H + 30,
    lastSlotLate: 22 * H + 30,
    lateDays: ['fri', 'sat'] as DayKey[],
    slotStep: 30,
  },

  /** A rough guide to how many tapas to order each. */
  platesPerPerson: 3,

  founders: [
    {
      name: 'Madeleine Lim',
      role: 'Co-founder',
      bio: 'Spent seven years as Food & Drink Editor at The Independent Magazine before swapping the review for the restaurant.',
    },
    {
      name: 'Hikmat Antippa',
      role: 'Co-founder',
      bio: 'Started out at J Sheekey (Caprice Holdings) and owns Meza, the award-winning Lebanese restaurant with two Tooting branches.',
    },
  ] satisfies Founder[],

  rooms: [
    {
      name: 'The front room',
      spanish: 'La barra',
      description: 'A marble-topped bar and high tables, made for a glass of something and a few quick bites.',
    },
    {
      name: 'The back room',
      spanish: 'La cocina',
      description: 'An open kitchen and proper tables for a proper meal — the place to settle in for the evening.',
    },
  ] satisfies Room[],

  allergenNotice:
    'Our dishes are prepared in a kitchen that handles nuts, sesame and other allergens, so we can’t guarantee any dish is free from traces. Please tell your server about any allergy or intolerance before you order.',
  serviceNote: 'A discretionary 12.5% service charge is added to your bill.',
  photoCredit: 'Photography by Mark Weeks, Xavi Meroño & Luana Failla',
};

export type Venue = typeof venue;
