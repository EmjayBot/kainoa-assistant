import { useEffect, useRef, useState } from 'react';

const FORUM = 'https://forum.theeastpacific.com';

export default function KainoaChat() {
  const [answers, setAnswers] = useState([]);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Aloha! I'm Kainoa — toggle Forum for live results." }
  ]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState('off');
  const [useKainoa, setUseKainoa] = useState(true);
  const [useForum, setUseForum] = useState(false);
  const [useWeb, setUseWeb] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const msgsRef = useRef(null);
  const base = import.meta.env.BASE_URL;

  useEffect(() => {
    fetch(`${base}data/responses/index.json`)
     .then(r => r.json())
     .then(m => Promise.all(m.map(f => fetch(`${base}data/responses/${f}`).then(r => r.json()))))
     .then(a => setAnswers(a.flat()))
     .catch(() => {});
  }, [base]);

  useEffect(() => { msgsRef.current?.scrollTo({ top: 99999, behavior: 'smooth' }); }, [messages]);

  const findKainoa = (q) => {
    const ql = q.toLowerCase().trim(); let best = null, score = 0;
    for (const a of answers) for (const k of a.keywords || []) {
      const kl = k.toLowerCase(); let s = 0;
      if (ql === kl) s = 100; else if (ql.includes(kl)) s = 80; else if (kl.includes(ql)) s = 60;
      if (s > score) { score = s; best = a; }
    }
    return score > 20? best : null;
  };

  // JSONP - no CORS needed
  const searchForum = (q) => {
    return new Promise((resolve) => {
      const cb = `kb_${Date.now()}`;
      console.log('[Forum] JSONP request:', q);

      window[cb] = (data) => {
        console.log('[Forum] JSONP response:', data);
        delete window[cb];
        document.getElementById(cb)?.remove();
        const topics = (data?.topics || []).map(t => ({
          title: t.title,
          url: `${FORUM}/t/${t.slug}/${t.id}`,
          excerpt: (t.excerpt || '').replace(/<[^>]*>/g, '')
        }));
        resolve(topics.slice(0, 5));
      };

      const s = document.createElement('script');
      s.id = cb;
      s.src = `${FORUM}/search.json?q=${encodeURIComponent(q)}&callback=${cb}`;
      s.onerror = () => { console.error('[Forum] JSONP failed'); resolve([]); };
      document.head.appendChild(s);

      setTimeout(() => { if (window[cb]) { console.warn('[Forum] timeout'); delete window[cb]; s.remove(); resolve([]); } }, 10000);
    });
  };

  const send = async () => {
    if (isSearching) return;
    const q = input.trim(); if (!q) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text: q }]);

    if (useKainoa) {
      const hit = findKainoa(q);
      if (hit) { setMessages(m => [...m, { role: 'bot', text: hit.answer, source: 'Kainoa' }]); return; }
    }

    if (useForum) {
      setIsSearching(true);
      setMessages(m => [...m, { role: 'bot', text: 'Searching forum...', source: 'Forum' }]);
      const results = await searchForum(q);
      setIsSearching(false);
      setMessages(m => m.slice(0, -1));

      if (!results.length) {
        setMessages(m => [...m, { role: 'bot', text: `No results for "${q}". Check console for [Forum] logs.`, source: 'Forum' }]);
        return;
      }
      const html = results.map(r => `<div style="margin-bottom:14px"><a href="${r.url}" target="_blank" style="color:#38bdf8;font-weight:500">${r.title}</a><div style="color:#94a3b8;font-size:13px;margin-top:4px">${r.excerpt}</div></div>`).join('');
      setMessages(m => [...m, { role: 'bot', text: html, source: 'Forum' }]);
      return;
    }

    setMessages(m => [...m, { role: 'bot', text: 'Enable Kainoa or Forum', source: 'Kainoa' }]);
  };

  const models = [{id:'off',label:'AI: OFF'},{id:'phi',label:'AI: PHI-3.5'},{id:'llama',label:'AI: LLAMA 3.2'}];
  const pill = "h-9 px-3.5 flex items-center gap-1.5 rounded-xl border text-sm font-medium";
  const on = "border-slate-600 bg-[#1e2533] text-slate-100";
  const off = "border-slate-800 bg-[#11151f] text-slate-400";

  return (
    <div style={{fontFamily:"'Lexend',sans-serif"}}>
      <div className="mb-6 flex flex-wrap gap-2">
        <button className={`${pill} ${model!=='off'?on:off} w-28 justify-between`}>
          <span>{models.find(m=>m.id===model).label}</span>
        </button>
        {[
          {v:useKainoa,s:setUseKainoa,l:'Kainoa'},
          {v:useForum,s:setUseForum,l:'Forum'},
          {v:useWeb,s:setUseWeb,l:'Web'}
        ].map(b=>(
          <button key={b.l} onClick={()=>b.s(!b.v)} disabled={isSearching} className={`${pill} ${b.v?on:off}`}>
            <span className={`w-3 h-3 rounded-sm border flex items-center justify-center text-[10px] ${b.v?'bg-sky-500 border-sky-500':'border-slate-600'}`}>{b.v?'✓':''}</span>
            {b.l}
          </button>
        ))}
      </div>

      <div ref={msgsRef} className="mb-5 space-y-5 max-h- overflow-y-auto">
        {messages.map((m,i)=>(
          <div key={i} className={`flex ${m.role==='user'?'justify-end':''}`}>
            <div className={`max-w-[88%] rounded-2xl border px-5 py-4 ${m.role==='user'?'bg-[#1a2333] border-slate-700':'bg-[#11151f] border-slate-800'}`}>
              {m.source&&<div className="mb-1.5 text- uppercase tracking-wide text-slate-500">{m.source}</div>}
              <div className="text-slate-200 leading-relaxed" dangerouslySetInnerHTML={{__html:m.text}}/>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} disabled={isSearching} placeholder={isSearching?"Searching...":"Ask..."} className="flex-1 h-11 rounded-xl bg-[#0f141f] border border-slate-700 px-4 text-white"/>
        <button onClick={send} disabled={isSearching} className="h-11 px-5 rounded-xl bg-sky-600 text-white text-sm">Send</button>
      </div>
    </div>
  );
}