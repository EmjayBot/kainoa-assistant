import { useEffect, useRef, useState } from 'react';

const FORUM = 'https://forum.theeastpacific.com';

export default function KainoaChat() {
  const [answers, setAnswers] = useState([]);
  const [messages, setMessages] = useState([{ role: 'bot', text: "Aloha! I'm Kainoa. KAINOA is on — toggle FORUM for live search." }]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState('off');
  const [useKainoa, setUseKainoa] = useState(true);
  const [useForum, setUseForum] = useState(false);
  const [useWeb, setUseWeb] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
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
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const url = `https://api.allorigins.win/get?url=${encodeURIComponent(`${FORUM}/search.json?q=${encodeURIComponent(q)}`)}`;
      const r = await fetch(url, { signal: controller.signal });
      const data = JSON.parse((await r.json()).contents);
      return (data.topics || []).slice(0,5).map(t => ({
        title: t.title,
        url: `${FORUM}/t/${t.slug}/${t.id}`,
        excerpt: (t.excerpt || '').replace(/<[^>]*>/g, '')
      }));
    } catch { return []; } finally { clearTimeout(timeout); }
  };

  const send = async () => {
    if (isSearching) return;
    const q = input.trim(); if (!q) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text: q }]);

    if (useKainoa) {
      const hit = findKainoa(q);
      if (hit) { setMessages(m => [...m, { role: 'bot', text: hit.answer, source: 'KAINOA' }]); return; }
    }

    if (useForum) {
      setIsSearching(true);
      const searchId = Date.now();
      setMessages(m => [...m, { role: 'bot', text: 'Searching forum...', source: 'FORUM', id: searchId }]);
      const results = await searchForum(q);
      setMessages(m => m.filter(msg => msg.id !== searchId));
      setIsSearching(false);
      if (results.length) {
        const html = results.map(r => `<div style="margin-bottom:10px"><a href="${r.url}" target="_blank" style="color:#38bdf8">${r.title}</a><div style="color:#94a3b8;font-size:12px">${r.excerpt}</div></div>`).join('');
        setMessages(m => [...m, { role: 'bot', text: html, source: 'FORUM' }]); return;
      }
    }
    setMessages(m => [...m, { role: 'bot', text: 'No results.', source: 'KAINOA' }]);
  };

  const models = [{id:'off',label:'AI: OFF'},{id:'phi',label:'AI: PHI-3.5'},{id:'llama',label:'AI: LLAMA 3.2'}];
  const pill = "h-8 px-3 flex items-center gap-2 rounded-xl border text- cursor-pointer";
  const on = "border-slate-700 bg-[#1a1f2b] text-slate-200"; const off = "border-slate-800 bg-[#11151f] text-slate-400";

  return (
    <div style={{fontFamily:"'Lexend', sans-serif"}}>
      <div className="mb-4 flex items-center gap-2.5">
        {/* BLANK SPACE WHERE K LOGO WAS */}
        <div style={{ width: 28, height: 28 }} />
        
        <div className="relative">
          <button onClick={()=>setAiOpen(o=>!o)} className={`${pill} ${model!=='off'?on:off} w-[120px] justify-between`} style={{fontFamily:"'Geom', sans-serif", fontWeight:800}}>
            <span>{models.find(m=>m.id===model)?.label}</span>
          </button>
        </div>
        {[{v:useKainoa,s:setUseKainoa,l:'KAINOA'},{v:useForum,s:setUseForum,l:'FORUM'},{v:useWeb,s:setUseWeb,l:'WEB'}].map(p=>(
          <button key={p.l} disabled={isSearching} onClick={()=>p.s(!p.v)} className={`${pill} ${p.v?on:off} ${isSearching?'opacity-50':''}`} style={{fontFamily:"'Geom', sans-serif", fontWeight:800}}>
            <span className={`w-4 h-4 rounded border-2 flex items-center justify-center ${p.v?'bg-sky-500 border-sky-500':'border-slate-600'}`}>{p.v&&'✓'}</span>
            {p.l}
          </button>
        ))}
      </div>

      <div ref={msgsRef} className="mb-3 space-y-3 max-h- overflow-y-auto">
        {messages.map((m,i)=>(
          <div key={i} className={`flex ${m.role==='user'?'justify-end':''}`}>
            <div className="max-w-[92%] rounded-2xl border border-slate-800 bg-[#11151f] px-4 py-3 text-slate-200">
              {m.source&&<div className="mb-1 text- uppercase text-sky-400" style={{fontFamily:"'Geom', sans-serif",fontWeight:800}}>{m.source}</div>}
              <div dangerouslySetInnerHTML={{__html:m.text}}/>
            </div>
          </div>
        ))}
      </div>

      <div className="relative">
        <input value={input} disabled={isSearching} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder={isSearching?"Searching...":"Ask about TEP..."} className="w-full h- rounded-2xl border border-slate-800 bg-[#11151f] pl-4 pr-24 text-white disabled:opacity-50"/>
        <button onClick={send} disabled={isSearching} className="absolute right-1.5 top-1/2 -translate-y-1/2 h- px-4 rounded-xl bg-sky-600 text-white disabled:opacity-50" style={{fontFamily:"'Geom', sans-serif", fontWeight:800, fontSize:'12px'}}>SEND</button>
      </div>
    </div>
  );
}