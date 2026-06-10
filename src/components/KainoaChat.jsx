import { useEffect, useRef, useState } from 'react';

export default function KainoaChat() {
  const [answers, setAnswers] = useState([]);
  const [messages, setMessages] = useState([{
    role: 'bot',
    text: "Aloha! I'm Kainoa. Ask about TEP citizenship — try 'apply' or toggle Forum for live search."
  }]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState('off');
  const [useForum, setUseForum] = useState(true);
  const [useKainoa, setUseKainoa] = useState(true);
  const [aiOpen, setAiOpen] = useState(false);
  const msgsRef = useRef(null);
  const aiRef = useRef(null);
  const base = import.meta.env.BASE_URL;

  // Load Kainoa instant answers
  useEffect(() => {
    const load = async () => {
      try {
        const manifest = await fetch(`${base}data/responses/index.json`).then(r => r.json());
        const results = await Promise.all(
          manifest.map(f => fetch(`${base}data/responses/${f}`).then(r => r.ok? r.json() : []))
        );
        setAnswers(results.flat());
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [base]);

  useEffect(() => { msgsRef.current?.scrollTo({ top: 99999 }); }, [messages]);

  useEffect(() => {
    const onClick = (e) => { if (aiRef.current &&!aiRef.current.contains(e.target)) setAiOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Kainoa keyword matcher (fixed syntax)
  const findKainoa = (q) => {
    const ql = q.toLowerCase().trim();
    let best = null, bestScore = 0;
    for (const a of answers) {
      for (const k of a.keywords || []) {
        const kl = k.toLowerCase();
        let score = 0;
        if (ql === kl) score = 100;
        else if (ql.includes(kl)) score = 80;
        else if (kl.includes(ql)) score = 60;
        else if (kl.split(' ').every(w => ql.includes(w))) score = 50;
        if (score > bestScore) { bestScore = score; best = a; }
      }
    }
    return bestScore > 20? best : null;
  };

  // Discourse forum search - works with posts + CORS fallback
  const searchForum = async (q) => {
    const query = encodeURIComponent(q);
    const endpoints = [
      `https://forum.theeastpacific.com/search.json?q=${query}`,
      `https://r.jina.ai/http://forum.theeastpacific.com/search.json?q=${query}`
    ];

    for (const url of endpoints) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();

        const posts = data.posts || [];
        const topics = data.topics || [];
        const topicMap = Object.fromEntries(topics.map(t => [t.id, t]));

        const results = posts.slice(0, 5).map(p => {
          const t = topicMap[p.topic_id] || {};
          const title = t.title || p.topic_title || 'Forum Post';
          const slug = t.slug || '';
          const link = `https://forum.theeastpacific.com/t/${slug}/${p.topic_id}/${p.post_number || 1}`;
          const date = t.last_posted_at? new Date(t.last_posted_at).toLocaleDateString() : '';
          return `• [${title}](${link})${date? ` — ${date}` : ''}`;
        });

        if (results.length) return results.join('\n');

        // fallback to topics if no posts
        if (topics.length) {
          return topics.slice(0, 3).map(t => {
            const link = `https://forum.theeastpacific.com/t/${t.slug}/${t.id}`;
            const date = new Date(t.last_posted_at).toLocaleDateString();
            return `• [${t.title}](${link}) — ${date}`;
          }).join('\n');
        }
      } catch (e) {
        console.warn('Forum search failed:', e);
      }
    }
    return null;
  };

  const send = async () => {
    const q = input.trim();
    if (!q) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text: q }]);

    const hit = useKainoa && findKainoa(q);
    if (hit) {
      setMessages(m => [...m, { role: 'bot', text: hit.answer, source: 'Kainoa' }]);
      return;
    }

    if (useForum) {
      setMessages(m => [...m, { role: 'bot', text: 'Searching forum...' }]);
      const results = await searchForum(q);
      const reply = results
       ? `**Forum results:**\n\n${results}`
        : `No forum hits. [Search directly](https://forum.theeastpacific.com/search?q=${encodeURIComponent(q)})`;
      setMessages(m => [...m.slice(0, -1), { role: 'bot', text: reply, source: 'Forum' }]);
    } else {
      setMessages(m => [...m, { role: 'bot', text: "Turn on Forum or Kainoa to get answers." }]);
    }
  };

  const models = [
    { id: 'off', label: 'AI: Off' },
    { id: 'phi-3.5-mini', label: 'AI: Phi-3.5' },
    { id: 'phi-3-medium', label: 'AI: Phi-3 Med' },
    { id: 'llama-3.2-3b', label: 'AI: Llama 3.2' },
  ];

  const pillReset = { display: 'flex', alignItems: 'center', height: '28px', boxSizing: 'border-box', margin: 0, lineHeight: 1 };
  const basePill = "px-3 gap-2 rounded-lg border text- select-none cursor-pointer";
  const pillIdle = "border-slate-700/40 bg-[#141722] text-slate-300 hover:bg-[#1a1f2e]";
  const pillActive = "border-cyan-800/60 bg-[#141722] text-cyan-300";

  return (
    <div className="bg-transparent" style={{ isolation: 'isolate' }}>
      <div className="mb-4 flex flex-col gap-2">
        <div className="relative w-full sm:w-" ref={aiRef}>
          <div role="button" tabIndex={0} onClick={() => setAiOpen(o =>!o)} style={pillReset} className={`${basePill} w-full justify-between pr-6 ${model!== 'off'? pillActive : pillIdle}`}>
            <span className="truncate">{models.find(m => m.id === model)?.label}</span>
            <svg className="absolute right-2" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5a6378" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
          </div>
          {aiOpen && (
            <div className="absolute z-20 mt-1 w-full rounded-lg border border-slate-700/60 bg-[#0f131c] shadow-xl overflow-hidden py-1">
              {models.map(m => (
                <button key={m.id} onClick={() => { setModel(m.id); setAiOpen(false); }} className={`w-full text-left px-3 py-1.5 text- hover:bg-[#1a1f2e] ${model === m.id? 'text-cyan-300' : 'text-slate-300'}`}>{m.label}</button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-[auto_auto] items-center gap-2 w-fit">
          {[{key:'forum',active:useForum,toggle:()=>setUseForum(v=>!v),label:'Forum'},{key:'kainoa',active:useKainoa,toggle:()=>setUseKainoa(v=>!v),label:'Kainoa'}].map(p=>(
            <div key={p.key} onClick={p.toggle} style={pillReset} className={`${basePill} ${p.active? pillActive : pillIdle}`}>
              <span className={`w-3.5 h-3.5 rounded- border flex items-center justify-center ${p.active? 'bg-cyan-500 border-cyan-500' : 'bg-[#0f121a] border-slate-600'}`}>
                {p.active && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M5 13l4 4 10-10"/></svg>}
              </span>
              <span>{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div ref={msgsRef} className="mb-3 space-y-3 max-h- overflow-y-auto pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user'? 'justify-end' : ''}`}>
            <div className="max-w-[92%] rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text- leading-relaxed text-slate-200">
              {m.source && <div className="mb-1 text- uppercase tracking-wide text-emerald-400">{m.source}</div>}
              <div dangerouslySetInnerHTML={{__html: m.text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-cyan-400 underline">$1</a>').replace(/\n/g, '<br/>')}} />
            </div>
          </div>
        ))}
      </div>

      <div className="relative">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ask about TEP..." className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3.5 pr-24 text- text-slate-100 placeholder-slate-500 outline-none" />
        <button onClick={send} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-cyan-600 px-5 py-2 text-sm font-medium text-white hover:bg-cyan-500">Send</button>
      </div>
    </div>
  );
}
