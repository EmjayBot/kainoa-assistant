import { useEffect, useRef, useState } from 'react';

const KLogo = ({ size = 28 }) => (
  <div className="shrink-0 flex items-center justify-center rounded-[10px] bg-gradient-to-br from-[#38bdf8] to-[#2563eb] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" style={{ width: size, height: size }}>
    <span className="font-semibold text-white leading-none" style={{ fontSize: size * 0.55 }}>K</span>
  </div>
);

export default function KainoaChat() {
  const [answers, setAnswers] = useState([]);
  const [messages, setMessages] = useState([{ role: 'bot', text: "Aloha! I'm Kainoa. Ask about TEP citizenship — try 'apply' or toggle Forum/Web for live search." }]);
  const [input, setInput] = useState(''); const [model, setModel] = useState('off');
  const [useKainoa, setUseKainoa] = useState(true); const [useForum, setUseForum] = useState(false); const [useWeb, setUseWeb] = useState(false);
  const [aiOpen, setAiOpen] = useState(false); const msgsRef = useRef(null); const aiRef = useRef(null); const base = import.meta.env.BASE_URL;

  useEffect(() => { fetch(`${base}data/responses/index.json`).then(r=>r.json()).then(m=>Promise.all(m.map(f=>fetch(`${base}data/responses/${f}`).then(r=>r.json())))).then(a=>setAnswers(a.flat())).catch(console.error); }, [base]);
  useEffect(() => { msgsRef.current?.scrollTo({ top: 99999, behavior: 'smooth' }); }, [messages]);

  const findKainoa = (q) => { const ql=q.toLowerCase().trim(); let b=null,s=0; for(const a of answers) for(const k of a.keywords||[]){ const kl=k.toLowerCase(); let sc=0; if(ql===kl)sc=100;else if(ql.includes(kl))sc=80;else if(kl.includes(ql))sc=60; if(sc>s){s=sc;b=a;}} return s>20?b:null; };

  // --- FIXED SEARCH ---
  const ddgSearch = async (query) => {
    const sources = [
      `https://r.jina.ai/http://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`,
      `https://r.jina.ai/http://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
      `https://s.jina.ai/${encodeURIComponent(query)}` // fallback: Jina search summary
    ];
    for (const url of sources) {
      try {
        const text = await fetch(url, { cache: 'no-store' }).then(r => r.text());
        const results = [];
        const re = /\[([^\]]{3,120})\]\((https?:\/\/(?!.*duckduckgo\.com|.*jina\.ai)[^)]+)\)/gi;
        let m;
        while ((m = re.exec(text))!== null && results.length < 5) {
          const title = m[1].replace(/\s+/g, ' ').trim();
          const link = m[2];
          if (title.length < 5) continue;
          results.push(`• [${title}](${link})`);
        }
        if (results.length) return results.join('\n');
      } catch (e) { console.warn('search fail', url, e); }
    }
    return null;
  };

  const send = async () => {
    const q = input.trim(); if (!q) return; setInput(''); setMessages(m => [...m, { role: 'user', text: q }]);
    const hit = useKainoa && findKainoa(q); if (hit) { setMessages(m => [...m, { role: 'bot', text: hit.answer, source: 'Kainoa' }]); return; }
    if (useForum) { setMessages(m => [...m, { role: 'bot', text: 'Searching forum...' }]); const r = await ddgSearch(`${q} site:forum.theeastpacific.com`); setMessages(m => [...m.slice(0,-1), { role: 'bot', text: r? `**Forum Results:**\n\n${r}` : `No forum results for "${q}". Try a broader term.`, source: 'Forum' }]); return; }
    if (useWeb) { setMessages(m => [...m, { role: 'bot', text: 'Searching web...' }]); const r = await ddgSearch(q); setMessages(m => [...m.slice(0,-1), { role: 'bot', text: r? `**Web Results:**\n\n${r}` : `No web results for "${q}".`, source: 'Web' }]); return; }
    setMessages(m => [...m, { role: 'bot', text: 'Enable Kainoa, Forum, or Web.' }]);
  };

  const models = [{id:'off',label:'AI: Off'},{id:'phi',label:'AI: Phi-3.5'},{id:'llama',label:'AI: Llama 3.2'}];
  const pill = "h-8 px-3 flex items-center gap-2 rounded-xl border text-[13px] font-medium select-none cursor-pointer transition";
  const on = "border-slate-700 bg-[#1a1f2b] text-slate-200"; const off = "border-slate-800 bg-[#11151f] text-slate-400 hover:bg-[#171c27]";

  return (
    <div>
      <div className="mb-4 flex items-center gap-2.5">
        <KLogo size={28} />
        <div className="relative" ref={aiRef}>
          <button onClick={() => setAiOpen(o =>!o)} className={`${pill} ${model!=='off'?on:off} w-[110px] justify-between`}><span>{models.find(m=>m.id===model)?.label}</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-50"><path d="M6 9l6 6 6-6"/></svg></button>
          {aiOpen && <div className="absolute z-20 mt-1.5 w-[110px] rounded-xl border border-slate-800 bg-[#0c1018] shadow-2xl py-1">{models.map(m=><button key={m.id} onClick={()=>{setModel(m.id);setAiOpen(false);}} className={`w-full text-left px-3 py-1.5 text-[13px] hover:bg-[#161b25] ${model===m.id?'text-white':'text-slate-400'}`}>{m.label}</button>)}</div>}
        </div>
        {[{k:'k',v:useKainoa,s:setUseKainoa,l:'Kainoa'},{k:'f',v:useForum,s:setUseForum,l:'Forum'},{k:'w',v:useWeb,s:setUseWeb,l:'Web'}].map(p=>(
          <button key={p.k} onClick={()=>p.s(!p.v)} className={`${pill} ${p.v?on:off}`}><span className={`w-4 h-4 rounded-[4px] border-2 flex items-center justify-center transition ${p.v?'bg-sky-500 border-sky-500':'border-slate-600'}`}>{p.v&&<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3"><path d="M5 13l4 4 10-10"/></svg>}</span>{p.l}</button>
        ))}
      </div>
      <div ref={msgsRef} className="mb-3 space-y-3 max-h-[55vh] overflow-y-auto pr-1">
        {messages.map((m,i)=>(<div key={i} className={`flex ${m.role==='user'?'justify-end':''}`}><div className="max-w-[92%] rounded-2xl border border-slate-800/80 bg-[#11151f] px-4 py-3 text-[14px] text-slate-200">{m.source&&<div className="mb-1 text-[10px] uppercase tracking-wide text-sky-400">{m.source}</div>}<div dangerouslySetInnerHTML={{__html:m.text.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" class="text-sky-400 hover:underline">$1</a>').replace(/\n/g,'<br/>')}}/></div></div>))}
      </div>
      <div className="relative">
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Ask about TEP..." className="w-full h-[48px] rounded-2xl border border-slate-800 bg-[#11151f] pl-4 pr-24 text-[14px] text-white placeholder-slate-500 outline-none focus:border-sky-900/50 focus:ring-1 focus:ring-sky-900/50" />
        <button onClick={send} className="absolute right-1.5 top-1/2 -translate-y-1/2 h-[36px] px-4 rounded-xl bg-sky-600 text-[14px] font-medium text-white hover:bg-sky-500">Send</button>
      </div>
    </div>
  );
}
