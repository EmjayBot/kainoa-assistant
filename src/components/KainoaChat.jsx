import { useEffect, useRef, useState } from 'react';

export default function KainoaChat() {
  const [answers, setAnswers] = useState([]);
  const [messages, setMessages] = useState([{ role: 'bot', text: "Aloha! I'm Kainoa. Type 'citizenship' to test my instant answers!" }]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState('off');
  const [useForum, setUseForum] = useState(true);
  const [useKainoa, setUseKainoa] = useState(true);
  const msgsRef = useRef(null);
  const base = import.meta.env.BASE_URL;

  useEffect(() => { fetch(`${base}responses.json`).then(r=>r.json()).then(setAnswers).catch(()=>{}); }, [base]);
  useEffect(() => { msgsRef.current?.scrollTo({ top: 99999 }); }, [messages]);

  const find = q => answers.find(a => a.keywords?.some(k => q.toLowerCase().includes(k)));
  const send = () => { const q=input.trim(); if(!q) return; setInput(''); setMessages(m=>[...m,{role:'user',text:q}]); const hit=useKainoa&&find(q); setTimeout(()=>setMessages(m=>[...m,{role:'bot',text:hit?hit.answer:"Try 'citizenship'"}]),100); };

  // ONE pill style for everything
  const pillBase = "h-7 px-2.5 inline-flex items-center gap-1.5 rounded-lg border text-[12px] transition-colors";
  const pillIdle = "border-slate-700/40 bg-[#141722] text-slate-300 hover:bg-[#1a1f2e]";
  const pillActive = "border-cyan-800/60 bg-[#141722] text-cyan-300";

  const TogglePill = ({ active, onClick, children }) => (
    <button type="button" onClick={onClick} className={`${pillBase} ${active? pillActive : pillIdle}`}>
      <span className={`w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center shrink-0 ${active? 'bg-cyan-500 border-cyan-500' : 'bg-[#0f121a] border-slate-600'}`}>
        {active && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
            <path d="M5 13l4 4 10-10" />
          </svg>
        )}
      </span>
      <span className="leading-none">{children}</span>
    </button>
  );

  return (
    <div className="bg-transparent">
      <div className="mb-4 flex flex-wrap items-center gap-2">

        {/* AI - now uses same height/structure as the others */}
        <div className="relative">
          <select
            value={model}
            onChange={e=>setModel(e.target.value)}
            className={`${pillBase} ${model!=='off'? pillActive : pillIdle} appearance-none pr-6 cursor-pointer`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235a6378' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 6px center',
              minWidth: '95px',
              lineHeight: '1'
            }}
          >
            <option value="off">AI: Off</option>
            <option value="phi-3.5-mini">AI: Phi-3.5</option>
            <option value="phi-3-medium">AI: Phi-3 Med</option>
            <option value="llama-3.2-3b">AI: Llama 3.2</option>
          </select>
        </div>

        <TogglePill active={useForum} onClick={()=>setUseForum(!useForum)}>Forum</TogglePill>
        <TogglePill active={useKainoa} onClick={()=>setUseKainoa(!useKainoa)}>Kainoa</TogglePill>
      </div>

      {/* Chat */}
      <div ref={msgsRef} className="mb-3 space-y-3">
        {messages.map((m,i)=>(
          <div key={i} className={`flex ${m.role==='user'?'justify-end':''}`}>
            <div className="max-w-[92%] rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-[14px]">{m.text}</div>
          </div>
        ))}
      </div>

      <div className="relative">
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}
          placeholder="Ask Kainoa about citizenship..."
          className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3.5 pr-24 text-[14px] outline-none" />
        <button onClick={send} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-cyan-600 px-5 py-2 text-sm font-medium hover:bg-cyan-500">Send</button>
      </div>
    </div>
  );
}
