import { useState, useEffect } from 'react';
import { searchForum, getLatest, ForumTopic } from '../lib/forum';

export default function ForumSearch() {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(false);
  const [latest, setLatest] = useState<ForumTopic[]>([]);

  useEffect(() => { getLatest().then(setLatest); }, []);

  useEffect(() => {
    if (!q.trim()) { setHits(latest); return; }
    setLoading(true);
    const id = setTimeout(async () => {
      try { setHits(await searchForum(q)); }
      catch { setHits([]); }
      finally { setLoading(false); }
    }, 250);
    return () => clearTimeout(id);
  }, [q, latest]);

  const list = q.trim() ? hits : latest;

  return (
    <div className="max-w-3xl mx-auto">
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Search forum.theeastpacific.com"
        className="w-full px-5 py-4 mb-6 bg-zinc-900 border border-zinc-800 rounded-2xl text-white focus:ring-2 focus:ring-violet-500 outline-none"
      />
      {loading && <div className="text-zinc-500 text-sm mb-4">Searching...</div>}
      <div className="space-y-3">
        {list.map(t => (
          <a key={t.id} href={t.url} target="_blank" rel="noreferrer"
             className="block p-4 bg-zinc-900/70 border border-zinc-800 rounded-xl hover:bg-zinc-900">
            <div className="text-white font-medium">{t.title}</div>
            <div className="text-zinc-400 text-sm mt-1 line-clamp-2">{t.excerpt}</div>
            <div className="text-zinc-600 text-xs mt-2">
              {t.posts_count} replies • {t.last_posted_at ? new Date(t.last_posted_at).toLocaleDateString() : ''}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}