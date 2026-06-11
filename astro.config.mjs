import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://kainoa.emjay.fyi',
  base: '/kainoa-assistant/',
  integrations: [
    react(),
    starlight({
      title: 'Kainoa',
      logo: {
        src: './src/assets/k-logo.svg',
        replacesTitle: false,
      },
      customCss: [
        './src/styles/custom.css',
      ],
      head: [
        {
          tag: 'link',
          attrs: {
            rel: 'preconnect',
            href: 'https://fonts.googleapis.com',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'preconnect',
            href: 'https://fonts.gstatic.com',
            crossorigin: true,
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: 'https://fonts.googleapis.com/css2?family=Geom:wght@300..900&family=Lexend:wght@400;500&display=swap',
          },
        },
      ],
      social: {
        github: 'https://github.com/EmjayBot/kainoa-assistant',
      },
      sidebar: [
        {
          label: 'Kainoa',
          items: [{ label: 'Assistant', link: '/kainoa/' }],
        },
      ],
    }),
    tailwind(),
  ],
});