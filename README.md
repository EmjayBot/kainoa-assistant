# Kainoa — TEP Assistant (Astro + Starlight)

No docs sidebar — just Starlight's header/footer with Kainoa as the main page.

## Setup
1. npm install
2. npm run dev
3. open http://localhost:4321/kainoa

## Files
- public/responses.json — edit Kainoa's instant answers
- public/forum-index.json — paste your forum index here
- src/components/KainoaChat.jsx — the chat UI

## Deploy
npm run build → dist/ (static, works on Cloudflare Pages, Netlify, GitHub Pages)
