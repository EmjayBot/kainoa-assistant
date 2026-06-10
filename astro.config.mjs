import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://emjaybot.github.io',
  base: '/kainoa-assistant/',
  integrations: [
    react(),
    starlight({
      title: 'Kainoa Assistant',
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