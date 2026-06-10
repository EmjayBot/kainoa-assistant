import { useEffect, useRef, useState } from 'react';

export default function KainoaChat() {
  const [answers, setAnswers] = useState([]);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Aloha! I'm Kainoa. Type 'citizenship' to test my instant answers!" }
  ]);
  const [input, setInput] = useState('');
  const [useAI, setUseAI] = useState(false);
  const [useForum, setUseForum] = useState(true);
  const [useKainoa, setUseKainoa] = useState(true);
  const msgsRef = useRef(null);
  const base = import.meta.env.BASE_URL;

  useEffect(() => { fetch(`${base}responses.json`).then(r=>r.json()).then(setAnswers).catch(()=>{}); }, [base]);
  useEffect(() => { msgsRef.current?.scrollTo({ top: 99999 }); }, [messages]);

  const find = q => answers.find(a => a.keywords?.some(k => q.toLowerCase().includes(k)));
  const send = () => { const q=input.trim(); if(!q) return; setInput(''); setMessages(m=>[...m,{role:'user',text:q}]); const hit=useKainoa&&find(q); setTimeout(()=>setMessages(m=>[...m,{role:'bot',text:hit?hit.answer:"Try 'citizenship'"}]),100); };

  const Row = ({checked, onChange, children}) => (
    <label className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-900/70 px-4 py-3 text- hover:bg-slate-800/60">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-5 w-5 rounded border-slate-600 bg-slate-800 accent-cyan-500" />
      <span className="text-slate-200">{children}</span>
    </label>
  );

  return (
    <div className="bg-transparent">
      {/* Controls - K is now in top bar, so just the rows */}
      <div className="mb-4 space-y-2">
        <button className="flex w-full items-center justify-between rounded-xl border border-slate-700/60 bg-slate-900/70 px-4 py-3 text- text-slate-300">
          Phi-3.5 Mini
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <Row checked={useAI} onChange={e=>setUseAI(e.target.checked)}>AI</Row>
        <Row checked={useForum} onChange={e=>setUseForum(e.target.checked)}>Forum</Row>
        <Row checked={useKainoa} onChange={e=>setUseKainoa(e.target.checked)}>Kainoa</Row>
      </div>

      {/* Chat */}
      <div ref={msgsRef} className="mb-3 space-y-3">
        {messages.map((m,i)=>(
          <div key={i} className={`flex ${m.role==='user'?'justify-end':''}`}>
            <div className="max-w-[92%] rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="relative">
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}
          placeholder="Ask Kainoa about citizenship..."
          className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3.5 pr-24 outline-none"
        />
        <button onClick={send} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-cyan-600 px-5 py-2">Send</button>
      </div>
    </div>
  );
}