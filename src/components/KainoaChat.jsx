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
    <label className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl border border-slate-700/60 bg-slate-900/70 px-3 py-2 text-sm hover:bg-slate-800/60">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 shrink-0 rounded border-slate-600 bg-slate-800 accent-cyan-500" />
      <span className="text-slate-200">{children}</span>
    </label>
  );

  return (
    <div className="bg-transparent">
      {/* HEADER - K icon left, vertical controls right */}
      <div className="mb-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
        <div className="flex items-start gap-3">
          {/* Keep the K */}
          <div className="grid h-14 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-b from-cyan-400 to-blue-600 text-lg font-bold text-white shadow-md">
            K
          </div>
          
          {/* Vertical stack - this fixes alignment */}
          <div className="flex flex-1 flex-col gap-2">
            <button className="flex w-full items-center justify-between rounded-xl border border-slate-700/60 bg-slate-900/70 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/60">
              <span>Phi-3.5 Mini</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            <Row checked={useAI} onChange={e=>setUseAI(e.target.checked)}>AI</Row>
            <Row checked={useForum} onChange={e=>setUseForum(e.target.checked)}>Forum</Row>
            <Row checked={useKainoa} onChange={e=>setUseKainoa(e.target.checked)}>Kainoa</Row>
          </div>
        </div>
      </div>

      {/* CHAT */}
      <div ref={msgsRef} className="mb-3 space-y-3">
        {messages.map((m,i)=>(
          <div key={i} className={`flex ${m.role==='user'?'justify-end':''}`}>
            <div className="max-w-[92%] rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text- leading-relaxed">
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div className="relative">
        <input 
          value={input} 
          onChange={e=>setInput(e.target.value)} 
          onKeyDown={e=>e.key==='Enter'&&send()}
          placeholder="Ask Kainoa about citizenship..."
          className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3.5 pr-24 text- outline-none placeholder:text-slate-500 focus:border-cyan-800"
        />
        <button onClick={send} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-cyan-600 px-5 py-2 text-sm font-medium">
          Send
        </button>
      </div>
    </div>
  );
}