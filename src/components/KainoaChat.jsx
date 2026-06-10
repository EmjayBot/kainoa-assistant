import { useEffect, useRef, useState } from 'react';

export default function KainoaChat() {
  const [forumIdx, setForumIdx] = useState([]);
  const [kainoaAnswers, setKainoaAnswers] = useState([]);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Aloha! I'm Kainoa. Type 'citizenship' to test." }
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
    const load = async () => {
      try {
        const [fRes, kRes] = await Promise.all([
          fetch(`${base}forum-index.json`),
          fetch(`${base}responses.json`)
        ]);
        const forum = fRes.ok? await fRes.json() : [];
        const kainoa = kRes.ok? await kRes.json() : [];
        setForumIdx(forum);
        setKainoaAnswers(kainoa);
        setIdxStatus(`${forum.length} topics • ${kainoa.length} answers`);
        console.log('Loaded from', base, forum.length, kainoa.length);
      } catch (e) {
        setIdxStatus('Error loading JSON');
        console.error(e);
      }
    };
    load();
    if (!navigator.gpu) setAiStatus('AI: mobile off');
  }, [base]);

  useEffect(() => { msgsRef.current?.scrollTo(0, 999999); }, [messages]);

  const findKainoa = (q) => {
    const lower = q.toLowerCase();
    return kainoaAnswers.find(a => a.keywords?.some(k => lower.includes(k.toLowerCase())));
  };

  const handleSend = () => {
    const q = input.trim(); if (!q) return;
    setInput(''); setMessages(m => [...m, {role:'user', text:q}]);
    const hit = useKainoa && findKainoa(q);
    setMessages(m => [...m, {role:'bot', text: hit? `🌺 ${hit.answer}` : 'No match (check responses.json path)'}]);
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Controls - fixed alignment */}
      <div className="mb-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 font-bold">K</div>
            <div>
              <div className="font-semibold">Kainoa Controls</div>
              <div className="text-xs text-slate-400">{idxStatus} • {aiStatus}</div>
            </div>
          </div>
        </div>
        <div className="mt-3 flex gap-5 text-sm">
          <label className="flex items-center gap-1.5"><input type="checkbox" checked={useAI} onChange={e=>setUseAI(e.target.checked)} disabled/> AI</label>
          <label className="flex items-center gap-1.5"><input type="checkbox" checked={useForum} onChange={e=>setUseForum(e.target.checked)}/> Forum</label>
          <label className="flex items-center gap-1.5"><input type="checkbox" checked={useKainoa} onChange={e=>setUseKainoa(e.target.checked)}/> Kainoa</label>
        </div>
      </div>

      <div ref={msgsRef} className="mb-3 h-[52vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
        {messages.map((m,i)=>(
          <div key={i} className={`mb-3 flex ${m.role==='user'?'justify-end':'justify-start'}`}>
            <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-[14px] ${m.role==='user'?'bg-cyan-900/40':'bg-slate-900'}`}>{m.text}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSend()} placeholder="Type citizenship…" className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm outline-none"/>
        <button onClick={handleSend} className="rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium">Send</button>
      </div>
    </div>
  );
}
