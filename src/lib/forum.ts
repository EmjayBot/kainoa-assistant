// Direct pull from forum.theeastpacific.com
// Works on static hosting via proxy; set USE_PROXY = false later

const FORUM = 'https://forum.theeastpacific.com';
const USE_PROXY = true;
const PROXY = 'https://api.allorigins.win/raw?url=';

const build = (path: string) => {
  const url = `${FORUM}${path}`;
  return USE_PROXY ? `${PROXY}${encodeURIComponent(url)}` : url;
};

export type ForumTopic = {
  id: number;
  title: string;
  url: string;
  excerpt: string;
  posts_count?: number;
  last_posted_at?: string;
};

async function get(path: string) {
  const r = await fetch(build(path), { 
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(10000)
  });
  if (!r.ok) throw new Error(`Forum ${r.status}`);
  return r.json();
}

export async function searchForum(q: string): Promise<ForumTopic[]> {
  if (!q.trim()) return [];
  const data = await get(`/search.json?q=${encodeURIComponent(q)}`);
  return (data.topics || []).slice(0, 10).map((t: any) => ({
    id: t.id,
    title: t.title,
    url: `${FORUM}/t/${t.slug}/${t.id}`,
    excerpt: (t.excerpt || '').replace(/<[^>]*>/g, ''),
    posts_count: t.posts_count,
    last_posted_at: t.last_posted_at
  }));
}

export async function getLatest(): Promise<ForumTopic[]> {
  const data = await get('/latest.json');
  return data.topic_list.topics.slice(0, 12).map((t: any) => ({
    id: t.id,
    title: t.title,
    url: `${FORUM}/t/${t.slug}/${t.id}`,
    excerpt: (t.excerpt || '').replace(/<[^>]*>/g, ''),
    posts_count: t.posts_count,
    last_posted_at: t.last_posted_at
  }));
}