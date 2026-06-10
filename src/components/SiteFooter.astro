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
      setIdxStatus(`0 topics • ${data.length} answers`);
    }).catch(()=> setIdxStatus('Error loading'));
    if (!navigator.gpu) setAiStatus('AI: mobile');
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
      {/* CONTROLS - ALIGNED */}
      <div className="mb-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="flex items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 font-bold">K</div>
            <div className="min-w-0">
              <div className="text-sm font-semibold">Kainoa Controls</div>
              <div className="text-[11px] text-slate-400">{idxStatus} • {aiStatus}</div>
            </div>
          </div>
          <div className="ml-3 flex gap-4">
            <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={useAI} onChange={e=>setUseAI(e.target.checked)} className="accent-cyan-500"/>AI</label>
            <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={useForum} onChange={e=>setUseForum(e.target.checked)} className="accent-cyan-500"/>Forum</label>
            <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={useKainoa} onChange={e=>setUseKainoa(e.target.checked)} className="accent-cyan-500"/>Kainoa</label>
          </div>
        </div>
      </div>

      {/* CHAT */}
      <div ref={msgsRef} className="mb-3 h-[50vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
        {messages.map((m,i)=>(
          <div key={i} className={`mb-2 flex ${m.role==='user'?'justify-end':'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${m.role==='user'?'bg-cyan-900/30':'bg-slate-900'}`}>{m.text}</div>
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div className="flex gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Ask about citizenship…" className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm"/>
        <button onClick={send} className="rounded-xl bg-cyan-600 px-4 py-2 text-sm">Send</button>
      </div>
    </div>
  );
}