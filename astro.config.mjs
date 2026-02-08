// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  site: 'https://abozzoli.github.io',
  base: '/blog/',
  integrations: [mdx(), icon({
    include: {
      mdi: ['github', 'linkedin', 'close', 'hamburger-menu', 'chevron-down', 'external-link', "briefcase-outline", "academic-cap-outline", "person-outline", "location-on-outline", "at", "telephone", "email-outline", "web", "information-outline", "note-text-outline", "hammer-wrench", "language", "printer-outline"],
    }
  })],
});