import { useEffect, useRef, useState } from 'react';

export default function KainoaChat() {
  const [answers, setAnswers] = useState([]);
  const [messages, setMessages] = useState([{
    role: 'bot',
    text: "Aloha! I'm Kainoa. Ask about TEP citizenship — try 'apply' or toggle Forum/Web for live search."
  }]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState('off');
  const [useKainoa, setUseKainoa] = useState(true);
  const [useForum, setUseForum] = useState(false);
  const [useWeb, setUseWeb] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const msgsRef = useRef(null);
  const aiRef = useRef(null);
  const base = import.meta.env.BASE_URL;

  useEffect(() => {
    fetch(`${base}data/responses/index.json`)
    .then(r => r.json())
    .then(m => Promise.all(m.map(f => fetch(`${base}data/responses/${f}`).then(r => r.json()))))
    .then(a => setAnswers(a.flat()))
    .catch(console.error);
  }, [base]);

  useEffect(() => { msgsRef.current?.scrollTo({ top: 99999, behavior: 'smooth' }); }, [messages]);
  useEffect(() => {
    const onClick = (e) => { if (aiRef.current &&!aiRef.current.contains(e.target)) setAiOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const findKainoa = (q) => {
    const ql = q.toLowerCase().trim();
    let best = null, score = 0;
    for (const a of answers) for (const k of a.keywords || []) {
      const kl = k.toLowerCase();
      let s = 0;
      if (ql === kl) s = 100; else if (ql.includes(kl)) s = 80; else if (kl.includes(ql)) s = 60;
      if (s > score) { score = s; best = a; }
    }
    return score > 20? best : null;
  };

  const ddgSearch = async (query) => {
    try {
      const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`)}`;
      const html = await fetch(proxy).then(r => r.text());
      const results = [...html.matchAll(/<a class="result__a"[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g)]
      .slice(0, 5)
      .map(m => `• [${m[2].replace(/<[^>]+>/g, '').trim()}](${m[1]})`);
      return results.length? results.join('\n') : null;
    } catch { return null; }
  };

  const send = async () => {
    const q = input.trim(); if (!q) return;
    setInput(''); setMessages(m => [...m, { role: 'user', text: q }]);

    const hit = useKainoa && findKainoa(q);
    if (hit) { setMessages(m => [...m, { role: 'bot', text: hit.answer, source: 'Kainoa' }]); return; }

    if (useForum) {
      setMessages(m => [...m, { role: 'bot', text: 'Searching forum...' }]);
      const r = await ddgSearch(`site:forum.theeastpacific.com ${q}`);
      setMessages(m => [...m.slice(0,-1), { role: 'bot', text: r? `**Forum:**\n\n${r}` : 'No results', source: 'Forum' }]);
      return;
    }
    if (useWeb) {
      setMessages(m => [...m, { role: 'bot', text: 'Searching web...' }]);
      const r = await ddgSearch(q);
      setMessages(m => [...m.slice(0,-1), { role: 'bot', text: r? `**Web:**\n\n${r}` : 'No results', source: 'Web' }]);
      return;
    }
    setMessages(m => [...m, { role: 'bot', text: 'Enable Kainoa, Forum, or Web.' }]);
  };

  const models = [
    { id: 'off', label: 'AI: Off' },
    { id: 'phi-3.5-mini', label: 'AI: Phi-3.5' },
    { id: 'phi-3-medium', label: 'AI: Phi-3 Med' },
    { id: 'llama-3.2-3b', label: 'AI: Llama 3.2' },
  ];

  const pillBase = "h-[28px] px-3 flex items-center gap-2 rounded-lg border text-[12px] select-none cursor-pointer transition";
  const pillOn = "border-cyan-800/60 bg-[#141722] text-cyan-300";
  const pillOff = "border-slate-700/40 bg-[#141722] text-slate-300 hover:bg-[#1a1f2e]";

  return (
    <div className="bg-transparent">
      {/* Controls */}
      <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <div className="flex items-center justify-center w-[28px] h-[28px] rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 shadow-sm shadow-cyan-900/30 shrink-0">
          <span className="text-[14px] font-bold text-black leading-none">K</span>
        </div>

        <div className="relative shrink-0" ref={aiRef}>
          <button onClick={() => setAiOpen(o =>!o)} className={`${pillBase} ${model!== 'off'? pillOn : pillOff} w-[120px] justify-between`}>
            <span className="truncate">{models.find(m => m.id === model)?.label}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-60"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          {aiOpen && (
            <div className="absolute z-20 mt-1 w-[120px] rounded-lg border border-slate-700/60 bg-[#0f131c] shadow-xl overflow-hidden py-1">
              {models.map(m => (
                <button key={m.id} onClick={() => { setModel(m.id); setAiOpen(false); }} className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-[#1a1f2e] ${model === m.id? 'text-cyan-300' : 'text-slate-300'}`}>{m.label}</button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {[
            {k:'kainoa', v:useKainoa, s:setUseKainoa, l:'Kainoa'},
            {k:'forum', v:useForum, s:setUseForum, l:'Forum'},
            {k:'web', v:useWeb, s:setUseWeb, l:'Web'},
          ].map(p => (
            <div key={p.k} onClick={() => p.s(!p.v)} className={`${pillBase} ${p.v? pillOn : pillOff}`}>
              <span className={`w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center ${p.v? 'bg-cyan-500 border-cyan-500' : 'border-slate-600'}`}>
                {p.v && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M5 13l4 4 10-10"/></svg>}
              </span>
              <span>{p.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div ref={msgsRef} className="mb-3 space-y-3 max-h-[55vh] overflow-y-auto pr-1">
        {messages.map((m,i) => (
          <div key={i} className={`flex ${m.role==='user'?'justify-end':''}`}>
            <div className="max-w-[92%] rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-[14px] text-slate-200">
              {m.source && <div className="mb-1 text-[10px] uppercase tracking-wide text-emerald-400">{m.source}</div>}
              <div dangerouslySetInnerHTML={{__html: m.text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-cyan-400 underline">$1</a>').replace(/\n/g,'<br/>')}}/>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="relative">
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Ask about TEP..." className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3.5 pr-20 text-[14px] text-slate-100 placeholder-slate-500 outline-none focus:ring-1 focus:ring-cyan-900/50" />
        <button onClick={send} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500">Send</button>
      </div>

      <style>{`.scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}.scrollbar-hide::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}
