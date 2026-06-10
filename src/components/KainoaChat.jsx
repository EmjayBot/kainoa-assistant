import { useEffect, useRef, useState } from 'react';

export default function KainoaChat() {
  const [kainoaAnswers, setKainoaAnswers] = useState([]);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Aloha! I'm Kainoa. Type 'citizenship'." }
  ]);
  const [input, setInput] = useState('');
  const [useAI, setUseAI] = useState(false);
  const [useForum, setUseForum] = useState(true);
  const [useKainoa, setUseKainoa] = useState(true);
  const msgsRef = useRef(null);
  const base = import.meta.env.BASE_URL;

  useEffect(() => {
    fetch(`${base}responses.json`).then(r => r.ok? r.json() : []).then(setKainoaAnswers);
  }, [base]);

  useEffect(() => { msgsRef.current?.scrollTo(0, 99999); }, [messages]);

  const findAnswer = (q) => {
    const lower = q.toLowerCase();
    return kainoaAnswers.find(a => a.keywords?.some(k => lower.includes(k)));
  };

  const send = () => {
    const q = input.trim(); if (!q) return;
    setInput('');
    setMessages(m => [...m, {role:'user', text:q}]);
    const hit = useKainoa && findAnswer(q);
    setTimeout(() => {
      setMessages(m => [...m, {role:'bot', text: hit? `🌺 ${hit.answer}` : 'Try "citizenship", "amendments", or "roster"'}]);
    }, 80);
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* FIXED CONTROLS - no wrap, perfect baseline */}
      <div className="mb-3 flex h-8 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-cyan-600 text-[11px] font-bold text-white">K</span>
          <span className="text-[15px] font-semibold text-slate-100">Kainoa</span>
        </div>

        {/* the key: flex-nowrap + shrink-0 + translate-y-px on inputs */}
        <div className="flex shrink-0 flex-nowrap items-center gap-3">
          <label className="flex items-center gap-1.5">
            <input type="checkbox" checked={useKainoa} onChange={e=>setUseKainoa(e.target.checked)}
              className="h-4 w-4 translate-y-[0.5px] accent-cyan-500" />
            <span className="text-[13px] leading-none text-slate-300">K</span>
          </label>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" checked={useForum} onChange={e=>setUseForum(e.target.checked)}
              className="h-4 w-4 translate-y-[0.5px] accent-cyan-500" />
            <span className="text-[13px] leading-none text-slate-300">F</span>
          </label>
          <label className="flex items-center gap-1.5 opacity-50">
            <input type="checkbox" checked={useAI} disabled
              className="h-4 w-4 translate-y-[0.5px] accent-cyan-500" />
            <span className="text-[13px] leading-none text-slate-500">AI</span>
          </label>
        </div>
      </div>

      {/* CHAT */}
      <div ref={msgsRef} className="mb-3 h-[55vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
        {messages.map((m,i)=>(
          <div key={i} className={`mb-2.5 flex ${m.role==='user'?'justify-end':'justify-start'}`}>
            <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[14px] leading-[1.4] ${m.role==='user'?'bg-cyan-900/30 border border-cyan-800/40':'bg-slate-900 border border-slate-800'}`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div className="flex gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}
          placeholder="Ask about citizenship…"
          className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-[14px] outline-none"/>
        <button onClick={send} className="rounded-xl bg-cyan-600 px-4 py-2.5 text-[14px] font-medium">Send</button>
      </div>
    </div>
  );
}