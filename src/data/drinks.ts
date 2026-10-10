export interface Drink {
  name: string;
  detail?: string;
  /** One price per measure in the group. Use null where a measure isn't offered. */
  prices: (number | null)[];
  /** Per-item measure labels, for items whose measures differ from their group. */
  measures?: string[];
}

export interface DrinkGroup {
  title?: string;
  /** Column headings for the prices, e.g. ['175ml', 'Bottle']. */
  measures?: string[];
  note?: string;
  items: Drink[];
}

export interface DrinkTab {
  id: string;
  label: string;
  /** Large display word for the tab panel. */
  display: string;
  intro?: string;
  groups: DrinkGroup[];
}

const p = (...prices: (number | null)[]) => prices;

export const drinks: DrinkTab[] = [
  {
    id: 'cocktails',
    label: 'Cocktails',
    display: 'Cócteles',
    intro: 'House cocktails — and the classics, if you’d rather.',
    groups: [
      {
        note: 'Classics also available',
        items: [
          { name: 'Tooting Mule', detail: 'gin, lemon, ginger, cucumber, lemon tonic', prices: p(13.5) },
          { name: 'Spanish Negroni', detail: 'Larios 12 gin, Yzaguirre vermouth, grapefruit liqueur', prices: p(13.5) },
          { name: 'Raspberry 75', detail: 'gin, raspberries, lemon, cava', prices: p(13.5) },
          { name: 'Tom Williams', detail: 'Pear Williams liqueur, gin, elderflower, lemon', prices: p(13.5) },
          { name: 'French Margarita', detail: 'tequila, elderflower liqueur, lime', prices: p(13.5) },
          { name: 'Old-Fashioned', prices: p(13.5) },
          { name: 'El Chamuquito', detail: 'mezcal, triple sec, Campari, passion fruit, lime', prices: p(14) },
          { name: 'Rosé Twinkle', detail: 'pink gin, elderflower, rosé cava', prices: p(14) },
          { name: 'Espresso Martini', detail: 'vodka, coffee liqueur, PX, espresso', prices: p(14) },
          { name: 'Flaming Pornstar Martini', prices: p(14) },
          { name: 'Hendrick’s Sour', prices: p(14) },
          { name: 'Passionfruit Caipirinha', prices: p(14) },
        ],
      },
    ],
  },
  {
    id: 'zero',
    label: 'Zero-proof',
    display: 'Sin alcohol',
    intro: 'All of the ceremony, none of the alcohol.',
    groups: [
      {
        items: [
          { name: 'Seedlip G&T', prices: p(8.5) },
          { name: 'Vermouth Spritz (0%)', prices: p(8.5) },
          { name: 'Shirley Temple', prices: p(7) },
          { name: 'Homemade Lemonade', prices: p(6.5) },
          { name: '0% Sangria', prices: p(9) },
          { name: '0% Passionfruit Bellini', prices: p(9) },
        ],
      },
    ],
  },
  {
    id: 'gin',
    label: 'Gin & Tonic',
    display: 'Gin tonic',
    groups: [
      {
        measures: ['50ml'],
        items: [
          { name: 'Beefeater 24', prices: p(10.5) },
          { name: 'Bloody Bens', prices: p(11.5) },
          { name: 'Hendrick’s', prices: p(12.5) },
          { name: 'Little Bird', prices: p(12.5) },
          { name: 'Larios 12', prices: p(12.5) },
          { name: 'Nordés', detail: 'Galician, made with Albariño grapes', prices: p(13.75) },
          { name: 'Gin Mare', prices: p(13.75) },
        ],
      },
    ],
  },
  {
    id: 'sherry',
    label: 'Sherry & Vermouth',
    display: 'Jerez y vermut',
    groups: [
      {
        title: 'Sherry',
        measures: ['70ml'],
        items: [
          { name: 'Manzanilla La Goya', prices: p(6.5) },
          { name: 'Fino Delgado Zuleta', prices: p(6.5) },
          { name: 'Amontillado Monteagudo', prices: p(8.5) },
        ],
      },
      {
        title: 'Vermouth',
        measures: ['100ml'],
        items: [
          { name: 'Yzaguirre', detail: 'red', prices: p(9) },
          { name: 'Zarro', detail: 'white', prices: p(9) },
          { name: 'Goyesco', detail: 'amber', prices: p(11) },
        ],
      },
    ],
  },
  {
    id: 'cava',
    label: 'Cava & Sangria',
    display: 'Cava y sangría',
    groups: [
      {
        title: 'Cava',
        measures: ['125ml', 'Bottle'],
        items: [
          { name: 'Pago de Tharsys', prices: p(9.5, 39) },
          { name: 'Flama d’Or Rosé', prices: p(12, 46) },
          { name: 'Muga Conde de Haro Brut Reserva 2020', prices: p(null, 50) },
        ],
      },
      {
        title: 'Sangria',
        measures: ['250ml', '1L jug'],
        items: [
          { name: 'Sangria', detail: 'red wine, PX, brandy, fruit', prices: p(13, 33) },
          { name: 'Sparkling grapefruit sangria', prices: p(13.5, 38) },
          { name: 'Jerez sangria', prices: p(14, 39) },
        ],
      },
    ],
  },
  {
    id: 'wine',
    label: 'Wine',
    display: 'Vino',
    groups: [
      {
        title: 'White',
        measures: ['175ml', 'Bottle'],
        items: [
          { name: 'Espeto Blanco', detail: 'Castilla', prices: p(8, 32) },
          { name: 'Inurrieta Orchidea Sauvignon Blanc', detail: 'Navarra', prices: p(9, 34) },
          { name: 'Madame Merseguera', detail: 'Alicante', prices: p(9.5, 35) },
          { name: 'López de Haro Viura', detail: 'Rioja', prices: p(10, 37) },
          { name: 'Pazos de Ulloa', detail: 'Ribeiro', prices: p(11, 42) },
          { name: 'Protos Verdejo', detail: 'Rueda', prices: p(12, 43) },
          { name: 'Bidaia Txakolina', prices: p(null, 44) },
          { name: 'Carlos Villanueva', detail: 'Ribeiro', prices: p(null, 45) },
          { name: 'Valtea Albariño', detail: 'Rías Baixas', prices: p(null, 47) },
          { name: 'Nora da Neve Albariño', detail: 'Rías Baixas', prices: p(null, 70) },
        ],
      },
      {
        title: 'Rosé',
        measures: ['175ml', 'Bottle'],
        items: [
          { name: 'Espeto Bobal', detail: 'Castilla', prices: p(8, 32) },
          { name: 'Tarima Monastrell', detail: 'Alicante', prices: p(11, 42) },
        ],
      },
      {
        title: 'Red',
        measures: ['175ml', 'Bottle'],
        items: [
          { name: 'Acantus Tempranillo', detail: 'Castilla', prices: p(8, 32) },
          { name: 'Tarima Organic Monastrell', detail: 'Alicante', prices: p(9, 34) },
          { name: 'López de Haro Crianza', detail: 'Rioja', prices: p(10, 37) },
          { name: 'Santa Julia Organic Malbec', prices: p(10.5, 38) },
          { name: 'L’Altre Biodynamic', detail: 'Costers del Segre', prices: p(11, 42) },
          { name: 'Cerro Añón Reserva', detail: 'Rioja', prices: p(null, 47) },
          { name: 'Tarima Hill Monastrell', detail: 'Alicante', prices: p(null, 50) },
          { name: 'Las Ocho', detail: 'Chozas Carrascal', prices: p(null, 56) },
          { name: 'Altún Villacardiel', detail: 'Rioja', prices: p(null, 57) },
          { name: 'Bellmunt Organic', detail: 'Priorat', prices: p(null, 58) },
          { name: 'Arzuaga Crianza', detail: 'Ribera del Duero', prices: p(null, 62) },
          { name: 'López de Haro Gran Reserva 2005', detail: 'Rioja', prices: p(null, 95) },
        ],
      },
    ],
  },
  {
    id: 'beer',
    label: 'Beer & Cider',
    display: 'Cerveza y sidra',
    groups: [
      {
        items: [
          { name: 'Estrella Galicia', detail: 'draught', prices: p(4.5, 7.5), measures: ['half', 'pint'] },
          { name: 'Estrella Galicia 1906 Reserva', prices: p(6.75) },
          { name: 'Alhambra Reserva', prices: p(6.75) },
          { name: 'Inedit', prices: p(6.5) },
          { name: 'Estrella Damm Daura', detail: 'gluten-free', prices: p(5.8) },
          { name: 'Estrella Galicia alcohol-free', prices: p(5) },
          { name: 'Complot IPA', prices: p(7) },
          { name: 'Maeloc dry cider', prices: p(6.75) },
        ],
      },
    ],
  },
  {
    id: 'coffee',
    label: 'Coffee & Soft',
    display: 'Café y refrescos',
    groups: [
      {
        items: [
          { name: 'Espresso', prices: p(3, 4) },
          { name: 'Latte, cappuccino, flat white, americano', prices: p(4.5) },
          { name: 'Tea', prices: p(4) },
          { name: 'Still or sparkling water (750ml), Coke, Coke Zero', prices: p(5) },
          { name: 'Lemonade, ginger beer, juices', prices: p(3.5) },
        ],
      },
    ],
  },
];

export const spiritsNote = {
  title: 'Spirits & digestivos',
  body: 'Our full list of spirits and digestivos is available at the bar — just ask.',
};
