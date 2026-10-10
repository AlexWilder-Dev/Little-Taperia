export type Allergen = 'gluten' | 'nuts' | 'dairy' | 'eggs' | 'shellfish';

export const allergens: { id: Allergen; label: string }[] = [
  { id: 'gluten', label: 'Gluten' },
  { id: 'nuts', label: 'Nuts' },
  { id: 'dairy', label: 'Dairy' },
  { id: 'eggs', label: 'Eggs' },
  { id: 'shellfish', label: 'Shellfish' },
];

export interface DishOption {
  id: string;
  /** Shown next to the price when a dish has more than one option. */
  label?: string;
  price: number;
}

export interface Dish {
  id: string;
  name: string;
  detail?: string;
  options: DishOption[];
  allergens: Allergen[];
}

export interface MenuSection {
  id: string;
  title: string;
  subtitle: string;
  dishes: Dish[];
}

const one = (id: string, price: number): DishOption[] => [{ id, price }];

// Dishes that appear in more than one section, as on the printed menu.
const friedGoatCheese: Dish = {
  id: 'fried-goat-cheese',
  name: 'Fried goat cheese',
  detail: 'honey, sage',
  options: one('fried-goat-cheese', 10),
  allergens: ['dairy', 'gluten', 'eggs'],
};

const cheesePlate: Dish = {
  id: 'spanish-cheese-plate',
  name: 'Spanish cheese plate',
  options: one('spanish-cheese-plate', 14),
  allergens: ['dairy'],
};

export const menu: MenuSection[] = [
  {
    id: 'aperitivos',
    title: 'Aperitivos',
    subtitle: 'Small bites to begin',
    dishes: [
      {
        id: 'sourdough',
        name: 'Toasted sourdough bread',
        detail: 'olive oil',
        options: one('sourdough', 4.5),
        allergens: ['gluten'],
      },
      { id: 'olives', name: 'Manzanilla olives', options: one('olives', 4.5), allergens: [] },
      { id: 'almonds', name: 'Toasted Marcona almonds', options: one('almonds', 4.5), allergens: ['nuts'] },
      {
        id: 'pan-con-tomate',
        name: 'Pan con tomate',
        options: [
          { id: 'pan-con-tomate', price: 7 },
          {
            id: 'pan-con-tomate-jamon',
            label: 'con Jamón Ibérico',
            price: 10,
          },
        ],
        allergens: ['gluten'],
      },
      { id: 'padron', name: 'Padrón peppers', detail: 'Maldon sea salt', options: one('padron', 8), allergens: [] },
      { id: 'boquerones', name: 'Boquerones', options: one('boquerones', 8), allergens: [] },
      { id: 'gildas', name: 'Gildas', options: one('gildas', 6), allergens: [] },
    ],
  },
  {
    id: 'carnes',
    title: 'Carnes',
    subtitle: 'Meat',
    dishes: [
      {
        id: 'croquetas-jamon',
        name: 'Croquetas de jamón',
        options: one('croquetas-jamon', 9),
        allergens: ['dairy', 'eggs', 'gluten'],
      },
      {
        id: 'morcilla-scotch-eggs',
        name: 'Morcilla Scotch eggs',
        detail: 'piquillo peppers',
        options: one('morcilla-scotch-eggs', 10),
        allergens: ['eggs', 'gluten'],
      },
      {
        id: 'albondigas',
        name: 'Albóndigas',
        detail: 'tomato sauce',
        options: one('albondigas', 10.5),
        allergens: ['dairy', 'eggs', 'gluten'],
      },
      { id: 'baby-chorizo', name: 'Baby chorizo', detail: 'red wine', options: one('baby-chorizo', 10), allergens: [] },
      {
        id: 'pinchos-morunos',
        name: 'Pinchos morunos de pollo',
        detail: 'chimichurri',
        options: one('pinchos-morunos', 14),
        allergens: ['eggs'],
      },
      {
        id: 'lamb-cutlets',
        name: 'Lamb cutlets',
        detail: 'baby potatoes, salsa verde',
        options: one('lamb-cutlets', 18.5),
        allergens: [],
      },
      {
        id: 'ox-cheeks',
        name: 'Ox cheeks',
        detail: 'PX sauce, parsnip purée',
        options: one('ox-cheeks', 20),
        allergens: ['dairy', 'gluten'],
      },
      {
        id: 'arroz-caldoso',
        name: 'Arroz caldoso',
        detail: 'chestnuts, mushrooms, grilled pluma Ibérica',
        options: one('arroz-caldoso', 22),
        allergens: ['nuts'],
      },
    ],
  },
  {
    id: 'mariscos',
    title: 'Mariscos',
    subtitle: 'Fish & seafood',
    dishes: [
      {
        id: 'salt-cod-fritters',
        name: 'Salt cod fritters',
        options: one('salt-cod-fritters', 8),
        allergens: ['gluten', 'eggs'],
      },
      {
        id: 'prawns',
        name: 'Prawns',
        detail: 'garlic, chilli',
        options: one('prawns', 13.5),
        allergens: ['shellfish'],
      },
      {
        id: 'octopus',
        name: 'Grilled octopus',
        detail: 'potatoes, ají amarillo',
        options: one('octopus', 20),
        allergens: [],
      },
      {
        id: 'arroz-negro',
        name: 'Arroz negro',
        detail: 'prawns, mussels',
        options: one('arroz-negro', 17.5),
        allergens: ['shellfish', 'eggs'],
      },
      {
        id: 'hake-orzo',
        name: 'Hake and piquillo orzo',
        options: one('hake-orzo', 17),
        allergens: ['shellfish', 'gluten'],
      },
      {
        id: 'scallops',
        name: 'Pan-fried scallops',
        detail: 'tarragon and sweet potato purée',
        options: one('scallops', 18),
        allergens: ['shellfish', 'dairy'],
      },
    ],
  },
  {
    id: 'verduras',
    title: 'Verduras y Ensaladas',
    subtitle: 'Vegetables & salads',
    dishes: [
      { id: 'bravas', name: 'Patatas bravas', options: one('bravas', 6.5), allergens: ['eggs'] },
      {
        id: 'croquetas-setas',
        name: 'Mushroom & truffle croquetas',
        options: one('croquetas-setas', 9.5),
        allergens: ['dairy', 'eggs', 'gluten'],
      },
      {
        id: 'tortilla',
        name: 'Tortilla',
        options: [
          { id: 'tortilla-potato', label: 'potato', price: 9 },
          { id: 'tortilla-artichoke', label: 'artichoke', price: 13 },
        ],
        allergens: ['eggs'],
      },
      {
        id: 'spinach-catalana',
        name: 'Spinach Catalana',
        detail: 'pine nuts, raisins',
        options: one('spinach-catalana', 8.5),
        allergens: ['nuts'],
      },
      {
        id: 'aubergine',
        name: 'Baked aubergine',
        detail: 'tomato sauce, manchego',
        options: one('aubergine', 10),
        allergens: ['dairy'],
      },
      {
        id: 'ensalada-verde',
        name: 'Ensalada verde',
        detail: 'blue cheese, apple, walnuts',
        options: one('ensalada-verde', 12),
        allergens: ['dairy', 'nuts'],
      },
      {
        id: 'beetroot-salad',
        name: 'Beetroot & goat cheese salad',
        detail: 'hazelnut dressing',
        options: one('beetroot-salad', 12),
        allergens: ['dairy', 'nuts'],
      },
      {
        id: 'hispi',
        name: 'Grilled hispi cabbage',
        detail: 'romesco sauce',
        options: one('hispi', 14),
        allergens: ['nuts', 'gluten'],
      },
    ],
  },
  {
    id: 'jamon-queso',
    title: 'Jamón y Queso',
    subtitle: 'Cured ham & cheese',
    dishes: [
      friedGoatCheese,
      cheesePlate,
      {
        id: 'jamon-iberico',
        name: 'Jamón Ibérico',
        options: [
          { id: 'jamon-cebo', label: 'de cebo', price: 15 },
          { id: 'jamon-bellota', label: 'de bellota', price: 21 },
        ],
        allergens: [],
      },
      { id: 'tabla-mixta', name: 'Tabla mixta', options: one('tabla-mixta', 22), allergens: ['dairy'] },
    ],
  },
  {
    id: 'desserts',
    title: 'Desserts',
    subtitle: 'Something sweet',
    dishes: [
      { id: 'crema-catalana', name: 'Crema Catalana', options: one('crema-catalana', 8), allergens: ['dairy', 'eggs'] },
      { id: 'churros', name: 'Churros con chocolate', options: one('churros', 8), allergens: ['dairy', 'gluten'] },
      cheesePlate,
      friedGoatCheese,
      { id: 'affogato', name: 'Affogato', options: one('affogato', 6), allergens: ['dairy'] },
    ],
  },
];
