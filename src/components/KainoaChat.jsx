import { useEffect, useRef, useState } from 'react';

const FORUM = 'https://forum.theeastpacific.com';

export default function KainoaChat() {
  const [answers, setAnswers] = useState([]);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Aloha! I'm Kainoa — ask about citizenship, the Magisterium, or toggle Forum for live results." }
  ]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState('off');
  const [useKainoa, setUseKainoa] = useState(true);
  const [useForum, setUseForum] = useState(false);
  const [useWeb, setUseWeb] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const msgsRef = useRef(null);
  const base = import.meta.env.BASE_URL;

  // Load local answers
  useEffect(() => {
    fetch(`${base}data/responses/index.json`)
     .then(r => r.json())
     .then(m => Promise.all(m.map(f => fetch(`${base}data/responses/${f}`).then(r => r.json()))))
     .then(a => setAnswers(a.flat()))
     .catch(() => setAnswers([]));
  }, [base]);

  useEffect(() => {
    msgsRef.current?.scrollTo({ top: 99999, behavior: 'smooth' });
  }, [messages]);

  const findKainoa = (q) => {
    const ql = q.toLowerCase().trim();
    let best = null, score = 0;
    for (const a of answers) {
      for (const k of a.keywords || []) {
        const kl = k.toLowerCase();
        let s = 0;
        if (ql === kl) s = 100;
        else if (ql.includes(kl)) s = 80;
        else if (kl.includes(ql)) s = 60;
        if (s > score) { score = s; best = a; }
      }
    }
    return score > 20? best : null;
  };

  // DIRECT Discourse fetch - works because kainoa.emjay.fyi is whitelisted
  const searchForum = async (q) => {
    try {
      const res = await fetch(`${FORUM}/search.json?q=${encodeURIComponent(q)}`, {
        headers: { 'Accept': 'application/json' },
        mode: 'cors',
        credentials: 'omit'
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      return (data.topics || []).slice(0, 5).map(t => ({
        title: t.title,
        url: `${FORUM}/t/${t.slug}/${t.id}`,
        excerpt: (t.excerpt || '').replace(/<[^>]*>/g, '')
      }));
    } catch (err) {
      console.error('Forum search error:', err);
      return [];
    }
  };

  const send = async () => {
    if (isSearching) return;
    const q = input.trim();
    if (!q) return;

    setInput('');
    setMessages(m => [...m, { role: 'user', text: q }]);

    // Try Kainoa first
    if (useKainoa) {
      const hit = findKainoa(q);
      if (hit) {
        setMessages(m => [...m, { role: 'bot', text: hit.answer, source: 'Kainoa' }]);
        return;
      }
    }

    // Try Forum
    if (useForum) {
      setIsSearching(true);
      const searchId = Date.now();
      setMessages(m => [...m, { role: 'bot', text: 'Searching forum...', source: 'Forum', id: searchId }]);

      const results = await searchForum(q);
      setMessages(m => m.filter(msg => msg.id!== searchId));
      setIsSearching(false);

      if (results.length) {
        const html = results.map(r => `
          <div class="mb-4 last:mb-0">
            <a href="${r.url}" target="_blank" class="text-sky-400 hover:text-sky-300 transition font-medium">${r.title}</a>
            <div class="text-slate-400 text-sm mt-1.5 leading-relaxed">${r.excerpt}</div>
          </div>
        `).join('');
        setMessages(m => [...m, { role: 'bot', text: html, source: 'Forum' }]);
        return;
      }
    }

    setMessages(m => [...m, { role: 'bot', text: 'No results found. Try toggling Forum on.', source: 'Kainoa' }]);
  };

  const models = [
    { id: 'off', label: 'AI: OFF' },
    { id: 'phi', label: 'AI: PHI-3.5' },
    { id: 'llama', label: 'AI: LLAMA 3.2' }
  ];

  const pill = "h-9 px-4 flex items-center gap-2 rounded-xl border text-sm transition cursor-pointer";
  const on = "border-slate-600 bg-[#1e2533] text-slate-100";
  const off = "border-slate-800 bg-[#11151f] text-slate-400 hover:border-slate-700";

  return (
    <div style={{ fontFamily: "'Lexend', system-ui, sans-serif" }} className="text-[15px]">
      {/* Controls */}
      <div className="mb-6 flex items-center gap-2.5 flex-wrap">
        <div style={{ width: 28, height: 28 }} />

        <button className={`${pill} ${model!== 'off'? on : off} w-[130px] justify-between font-medium`}>
          <span>{models.find(m => m.id === model)?.label}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-60">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>

        {[
          { v: useKainoa, s: setUseKainoa, l: 'Kainoa' },
          { v: useForum, s: setUseForum, l: 'Forum' },
          { v: useWeb, s: setUseWeb, l: 'Web' }
        ].map(p => (
          <button
            key={p.l}
            disabled={isSearching}
            onClick={() => p.s(!p.v)}
            className={`${pill} ${p.v? on : off} ${isSearching? 'opacity-50' : ''} font-medium`}
          >
            <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition ${p.v? 'bg-sky-500 border-sky-500' : 'border-slate-600'}`}>
              {p.v && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <path d="M5 13l4 4L19 7"/>
                </svg>
              )}
            </span>
            {p.l}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div ref={msgsRef} className="mb-5 space-y-5 max-h-[65vh] overflow-y-auto pr-2 -mr-2">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user'? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[88%] rounded-2xl border px-5 py-4 shadow-sm ${
              m.role === 'user'
               ? 'bg-[#1a2333] border-slate-700'
                : 'bg-[#11151f] border-slate-800'
            }`}>
              {m.source && (
                <div className="mb-2 text-[11px] uppercase tracking-wider text-slate-500 font-medium">
                  {m.source}
                </div>
              )}
              <div
                className="text-slate-200 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: m.text }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="relative">
        <input
          value={input}
          disabled={isSearching}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder={isSearching? "Searching forum..." : "Ask about TEP..."}
          className="w-full h-12 rounded-2xl border border-slate-700 bg-[#0f141f] pl-5 pr-28 text-white placeholder-slate-500 outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600/30 transition disabled:opacity-50"
        />
        <button
          onClick={send}
          disabled={isSearching}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 px-5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
}