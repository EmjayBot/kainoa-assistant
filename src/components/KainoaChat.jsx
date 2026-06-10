import { useEffect, useRef, useState } from 'react';

export default function KainoaChat() {
  const [answers, setAnswers] = useState([]);
  const [messages, setMessages] = useState([{
    role: 'bot',
    text: "Aloha! I'm Kainoa. Toggle Kainoa for instant answers, Forum for TEP forum, or Web for DuckDuckGo."
  }]);
  const [input, setInput] = useState('');
  const [useKainoa, setUseKainoa] = useState(true);
  const [useForum, setUseForum] = useState(false);
  const [useWeb, setUseWeb] = useState(false);
  const msgsRef = useRef(null);
  const base = import.meta.env.BASE_URL;

  // Load instant answers
  useEffect(() => {
    const load = async () => {
      try {
        const manifest = await fetch(`${base}data/responses/index.json`).then(r => r.json());
        const files = await Promise.all(manifest.map(f =>
          fetch(`${base}data/responses/${f}`).then(r => r.ok? r.json() : [])
        ));
        setAnswers(files.flat());
      } catch (e) { console.error(e); }
    };
    load();
  }, [base]);

  useEffect(() => { msgsRef.current?.scrollTo({ top: 99999, behavior: 'smooth' }); }, [messages]);

  // Kainoa matcher
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

  // DuckDuckGo helper
  const ddgSearch = async (query) => {
    try {
      const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(
        `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`
      )}`;
      const html = await fetch(proxy).then(r => r.text());
      const results = [...html.matchAll(/<a class="result__a"[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g)]
       .slice(0, 5)
       .map(m => {
          const url = m[1];
          const title = m[2].replace(/<[^>]+>/g, '').trim();
          return `• [${title}](${url})`;
        });
      return results.length? results.join('\n') : null;
    } catch (e) {
      console.error('DDG error', e);
      return null;
    }
  };

  const searchForum = (q) => ddgSearch(`site:forum.theeastpacific.com ${q}`);
  const searchWeb = (q) => ddgSearch(q);

  const send = async () => {
    const q = input.trim();
    if (!q) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text: q }]);

    // 1. Kainoa
    const hit = useKainoa && findKainoa(q);
    if (hit) {
      setMessages(m => [...m, { role: 'bot', text: hit.answer, source: 'Kainoa' }]);
      return;
    }

    // 2. Forum
    if (useForum) {
      setMessages(m => [...m, { role: 'bot', text: 'Searching forum...' }]);
      const results = await searchForum(q);
      const reply = results
       ? `**Forum results:**\n\n${results}`
        : `No forum results. [Search forum directly](https://forum.theeastpacific.com/search?q=${encodeURIComponent(q)})`;
      setMessages(m => [...m.slice(0, -1), { role: 'bot', text: reply, source: 'Forum' }]);
      return;
    }

    // 3. Web
    if (useWeb) {
      setMessages(m => [...m, { role: 'bot', text: 'Searching web...' }]);
      const results = await searchWeb(q);
      const reply = results
       ? `**Web results:**\n\n${results}`
        : `[Search DuckDuckGo](https://duckduckgo.com/html/?q=${encodeURIComponent(q)})`;
      setMessages(m => [...m.slice(0, -1), { role: 'bot', text: reply, source: 'Web' }]);
      return;
    }

    setMessages(m => [...m, { role: 'bot', text: 'Turn on Kainoa, Forum, or Web.' }]);
  };

  const Pill = ({ active, onClick, label }) => (
    <div onClick={onClick} className={`px-3 h-[28px] flex items-center gap-2 rounded-lg border text-[12px] select-none cursor-pointer ${active? 'border-cyan-800/60 bg-[#141722] text-cyan-300' : 'border-slate-700/40 bg-[#141722] text-slate-300 hover:bg-[#1a1f2e]'}`}>
      <span className={`w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center ${active? 'bg-cyan-500 border-cyan-500' : 'bg-[#0f121a] border-slate-600'}`}>
        {active && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M5 13l4 4 10-10"/></svg>}
      </span>
      <span>{label}</span>
    </div>
  );

  return (
    <div className="bg-transparent" style={{ isolation: 'isolate' }}>
      <div className="mb-4 flex gap-2">
        <Pill active={useKainoa} onClick={() => setUseKainoa(v =>!v)} label="Kainoa" />
        <Pill active={useForum} onClick={() => setUseForum(v =>!v)} label="Forum" />
        <Pill active={useWeb} onClick={() => setUseWeb(v =>!v)} label="Web" />
      </div>

      <div ref={msgsRef} className="mb-3 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user'? 'justify-end' : ''}`}>
            <div className="max-w-[92%] rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-[14px] leading-relaxed text-slate-200">
              {m.source && <div className="mb-1 text-[10px] uppercase tracking-wide text-emerald-400">{m.source}</div>}
              <div dangerouslySetInnerHTML={{ __html: m.text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-cyan-400 underline hover:text-cyan-300">$1</a>').replace(/\n/g, '<br/>') }} />
            </div>
          </div>
        ))}
      </div>

      <div className="relative">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask about TEP..."
          className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3.5 pr-24 text-[14px] text-slate-100 placeholder-slate-500 outline-none focus:ring-1 focus:ring-cyan-900/50"
        />
        <button onClick={send} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-cyan-600 px-5 py-2 text-sm font-medium text-white hover:bg-cyan-500 active:bg-cyan-700">
          Send
        </button>
      </div>
    </div>
  );
}
