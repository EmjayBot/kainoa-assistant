import { useEffect, useRef, useState } from 'react';

export default function KainoaChat() {
  const [forumIdx, setForumIdx] = useState([]);
  const [kainoaAnswers, setKainoaAnswers] = useState([]);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Aloha! I'm Kainoa. Type 'citizenship'." }
  ]);
  const [input, setInput] = useState('');
  const [useAI, setUseAI] = useState(false);
  const [useForum, setUseForum] = useState(true);
  const [useKainoa, setUseKainoa] = useState(true);
  const [aiStatus, setAiStatus] = useState('AI: off');
  const [idxStatus, setIdxStatus] = useState('Loading…');
  const msgsRef = useRef(null);
  const base = import.meta.env.BASE_URL;

  useEffect(() => {
    fetch(`${base}responses.json`).then(r => r.ok? r.json() : []).then(data => {
      setKainoaAnswers(data);
      setIdxStatus(`${data.length} answers`);
    }).catch(()=> setIdxStatus('Error'));
    if (!navigator.gpu) setAiStatus('mobile');
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
    }, 100);
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* DESIGN 3 - MINIMAL TOP BAR */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-cyan-600 text-[11px] font-bold leading-none">K</span>
          Kainoa
        </h2>
        <div className="flex items-center gap-3">
          <span className="hidden text-[11px] text-slate-500 sm:block">{idxStatus} • {aiStatus}</span>
          <div className="flex items-center gap-2.5">
            <label className="flex cursor-pointer items-center gap-1 text-[11px] text-slate-300">
              <input type="checkbox" checked={useKainoa} onChange={e=>setUseKainoa(e.target.checked)} className="h-3.5 w-3.5 accent-cyan-500"/>
              K
            </label>
            <label className="flex cursor-pointer items-center gap-1 text-[11px] text-slate-300">
              <input type="checkbox" checked={useForum} onChange={e=>setUseForum(e.target.checked)} className="h-3.5 w-3.5 accent-cyan-500"/>
              F
            </label>
            <label className="flex cursor-not-allowed items-center gap-1 text-[11px] text-slate-500">
              <input type="checkbox" checked={useAI} disabled className="h-3.5 w-3.5 accent-cyan-500"/>
              AI
            </label>
          </div>
        </div>
      </div>

      {/* CHAT */}
      <div ref={msgsRef} className="mb-3 h-[55vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:h-[60vh]">
        {messages.map((m,i)=>(
          <div key={i} className={`mb-2.5 flex ${m.role==='user'?'justify-end':'justify-start'}`}>
            <div className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[14px] leading-snug ${m.role==='user'?'bg-cyan-900/30 border border-cyan-800/50':'bg-slate-900 border border-slate-800'}`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&send()}
          placeholder="Ask about citizenship…"
          className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm outline-none placeholder:text-slate-500 focus:border-cyan-800"
        />
        <button onClick={send} className="shrink-0 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium transition hover:bg-cyan-500 active:bg-cyan-700">
          Send
        </button>
      </div>
    </div>
  );
}