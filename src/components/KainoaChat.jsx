import { useEffect, useRef, useState } from 'react';

const KLogo = ({ size = 28 }) => (
  <div className="shrink-0 flex items-center justify-center rounded-[10px] bg-gradient-to-br from-[#38bdf8] to-[#2563eb]" style={{ width: size, height: size }}>
    <span style={{ fontFamily: "'Geom', sans-serif", fontWeight: 800, fontSize: size * 0.6, color: 'white' }}>K</span>
  </div>
);

const FORUM = 'https://forum.theeastpacific.com';
const PROXY = 'https://api.allorigins.win/raw?url=';

export default function KainoaChat() {
  const [answers, setAnswers] = useState([]);
  const [messages, setMessages] = useState([{ role: 'bot', text: "Aloha! I'm Kainoa. Ask about TEP citizenship — try 'apply' or toggle FORUM for live search." }]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState('off');
  const [useKainoa, setUseKainoa] = useState(true);
  const [useForum, setUseForum] = useState(false);
  const [useWeb, setUseWeb] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const msgsRef = useRef(null);
  const base = import.meta.env.BASE_URL;

  useEffect(() => {
    fetch(`${base}data/responses/index.json`)
     .then(r => r.json())
     .then(m => Promise.all(m.map(f => fetch(`${base}data/responses/${f}`).then(r => r.json()))))
     .then(a => setAnswers(a.flat()))
     .catch(console.error);
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

  const searchForum = async (q) => {
    try {
      const url = `${PROXY}${encodeURIComponent(`${FORUM}/search.json?q=${encodeURIComponent(q)}`)}`;
      const r = await fetch(url);
      const data = await r.json();
      return (data.topics || []).slice(0, 5).map(t => ({
        title: t.title,
        url: `${FORUM}/t/${t.slug}/${t.id}`,
        excerpt: (t.excerpt || '').replace(/<[^>]*>/g, '')
      }));
    } catch (e) { console.error(e); return []; }
  };

  const searchWeb = async (q) => { return []; }; // leave for later

  const send = async () => {
    const q = input.trim(); if (!q) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text: q }]);

    // 1. Kainoa manual
    if (useKainoa) {
      const hit = findKainoa(q);
      if (hit) {
        setMessages(m => [...m, { role: 'bot', text: hit.answer, source: 'KAINOA' }]);
        return;
      }
    }

    // 2. Forum
    if (useForum) {
      setMessages(m => [...m, { role: 'bot', text: 'Searching forum...', source: 'FORUM' }]);
      const results = await searchForum(q);
      setMessages(m => m.slice(0, -1)); // remove "searching"
      if (results.length) {
        const html = results.map(r =>
          `<div class="mb-3"><a href="${r.url}" target="_blank" class="text-sky-400 hover:underline">${r.title}</a><div class="text-xs text-slate-400 mt-1">${r.excerpt}</div></div>`
        ).join('');
        setMessages(m => [...m, { role: 'bot', text: html, source: 'FORUM' }]);
        return;
      }
    }

    // 3. Web (placeholder)
    if (useWeb) {
      const web = await searchWeb(q);
      if (web.length) { /* render */ return; }
    }

    setMessages(m => [...m, { role: 'bot', text: "No results. Try turning on FORUM.", source: 'KAINOA' }]);
  };

  const models = [{id:'off',label:'AI: OFF'},{id:'phi',label:'AI: PHI-3.5'},{id:'llama',label:'AI: LLAMA 3.2'}];
  const pill = "h-8 px-3 flex items-center gap-2 rounded-xl border text-[12px] select-none cursor-pointer";
  const on = "border-slate-700 bg-[#1a1f2b] text-slate-200"; const off = "border-slate-800 bg-[#11151f] text-slate-400";

  return (
    <div style={{fontFamily:"'Lexend', sans-serif"}}>
      <div className="mb-4 flex items-center gap-2.5">
        <KLogo size={28}/>
        {/*... your toggle buttons unchanged... */}
        {[{k:'k',v:useKainoa,s:setUseKainoa,l:'KAINOA'},{k:'f',v:useForum,s:setUseForum,l:'FORUM'},{k:'w',v:useWeb,s:setUseWeb,l:'WEB'}].map(p=>(
          <button key={p.k} onClick={()=>p.s(!p.v)} className={`${pill} ${p.v?on:off}`} style={{fontFamily:"'Geom', sans-serif", fontWeight:800}}>
            <span className={`w-4 h-4 rounded-[4px] border-2 flex items-center justify-center ${p.v?'bg-sky-500 border-sky-500':'border-slate-600'}`}>{p.v&&'✓'}</span>
            {p.l}
          </button>
        ))}
      </div>

      <div ref={msgsRef} className="mb-3 space-y-3 max-h-[55vh] overflow-y-auto pr-1">
        {messages.map((m,i)=>(
          <div key={i} className={`flex ${m.role==='user'?'justify-end':''}`}>
            <div className="max-w-[92%] rounded-2xl border border-slate-800/80 bg-[#11151f] px-4 py-3 text-[14px] text-slate-200">
              {m.source&&<div className="mb-1 text-[10px] uppercase text-sky-400" style={{fontFamily:"'Geom', sans-serif",fontWeight:800}}>{m.source}</div>}
              <div dangerouslySetInnerHTML={{__html:m.text.replace(/\n/g,'<br/>')}}/>
            </div>
          </div>
        ))}
      </div>

      <div className="relative">
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Ask about TEP..." className="w-full h-[48px] rounded-2xl border border-slate-800 bg-[#11151f] pl-4 pr-24 text-white"/>
        <button onClick={send} className="absolute right-1.5 top-1/2 -translate-y-1/2 h-[36px] px-4 rounded-xl bg-sky-600 text-white" style={{fontFamily:"'Geom', sans-serif", fontWeight:800}}>SEND</button>
      </div>
    </div>
  );
}