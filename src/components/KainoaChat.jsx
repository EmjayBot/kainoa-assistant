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
      {/* STACKED CONTROLS */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2 pt-1">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-cyan-600 text-sm font-bold text-white">K</span>
          <span className="text-base font-semibold text-slate-100">Kainoa</span>
        </div>

        <div className="flex flex-col items-start gap-1.5 pr-1">
          <label className="flex items-center gap-2 text-[13px] text-slate-400">
            <input type="checkbox" checked={useAI} disabled className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-cyan-500" />
            AI
          </label>
          <label className="flex items-center gap-2 text-[13px] text-slate-200">
            <input type="checkbox" checked={useForum} onChange={e=>setUseForum(e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-cyan-500" />
            Forum
          </label>
          <label className="flex items-center gap-2 text-[13px] text-slate-200">
            <input type="checkbox" checked={useKainoa} onChange={e=>setUseKainoa(e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-cyan-500" />
            Answers
          </label>
        </div>
      </div>

      {/* CHAT */}
      <div ref={msgsRef} className="mb-3 h-[52vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
        {messages.map((m,i)=>(
          <div key={i} className={`mb-2.5 flex ${m.role==='user'?'justify-end':'justify-start'}`}>
            <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[14px] leading-snug ${m.role==='user'?'bg-cyan-900/30 border border-cyan-800/40':'bg-slate-900 border border-slate-800'}`}>
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