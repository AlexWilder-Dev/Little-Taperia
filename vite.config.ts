import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import { venue } from './src/data/venue.ts';

/**
 * Optional absolute site URL (e.g. https://user.github.io/repo/) so Open Graph
 * tags carry absolute links. Without it they stay relative, which still works
 * for the page itself.
 */
const siteUrl = (process.env.SITE_URL ?? '').replace(/\/?$/, process.env.SITE_URL ? '/' : '');

function restaurantJsonLd() {
  const time = (minutes: number) =>
    minutes >= 1440
      ? '23:59'
      : `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: venue.name,
    description: venue.description,
    url: venue.website,
    telephone: venue.phone.tel,
    email: venue.email,
    servesCuisine: ['Spanish', 'Tapas'],
    acceptsReservations: venue.bookingUrl,
    image: `${siteUrl || './'}og-image.jpg`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: venue.address.street,
      addressLocality: venue.address.locality,
      postalCode: venue.address.postcode,
      addressCountry: venue.address.country,
    },
    openingHoursSpecification: venue.hours.map((day) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${day.schemaDay}`,
      opens: time(day.open),
      closes: time(day.close),
    })),
    sameAs: venue.socials.map((social) => social.url),
  };
}

function siteMeta(): Plugin {
  return {
    name: 'site-meta',
    transformIndexHtml(html) {
      const withUrls = siteUrl
        ? html.replaceAll('%SITE_URL%', siteUrl)
        : html.replace(/\s*<meta property="og:url"[^>]*>/, '').replaceAll('%SITE_URL%', './');
      return withUrls.replace(
        '<!-- json-ld -->',
        `<script type="application/ld+json">${JSON.stringify(restaurantJsonLd())}</script>`,
      );
    },
  };
}

export default defineConfig({
  // Relative base so the build works from any GitHub Pages path
  base: './',
  plugins: [react(), siteMeta()],
  build: {
    target: 'es2022',
    assetsInlineLimit: 2048,
  },
});
