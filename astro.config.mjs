import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://emjaybot.github.io',
  base: '/kainoa-assistant/',
  integrations: [
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