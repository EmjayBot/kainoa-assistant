import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://kainoa.tep',
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
    starlight({
      title: 'Kainoa',
      logo: {
        src: './src/assets/k.svg',
      },
      social: {
        discord: 'https://discord.gg/theeastpacific',
        'x.com': 'https://x.com',
      },
      customCss: ['./src/styles/custom.css'],
      sidebar: [], // no docs sidebar
      head: [
        {
          tag: 'meta',
          attrs: { name: 'description', content: 'Kainoa — TEP Community Assistant' }
        }
      ],
    }),
  ],
});
