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

  // Match your screenshot exactly - small compact pills
  const pill = "h-7 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-700/40 bg-[#141722] text-[12px] text-slate-300";

  return (
    <div className="bg-transparent">
      <div className="mb-4 flex flex-wrap items-center gap-2">

        {/* AI - matches your screenshot */}
        <div className="relative">
          <select
            value={model}
            onChange={e=>setModel(e.target.value)}
            className={`${pill} appearance-none pr-6 cursor-pointer hover:bg-[#1a1f2e] focus:outline-none focus:ring-1 focus:ring-cyan-900/50`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235a6378' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 6px center',
              minWidth: '95px'
            }}
          >
            <option value="off">AI: Off</option>
            <option value="phi-3.5-mini">AI: Phi-3.5</option>
            <option value="phi-3-medium">AI: Phi-3 Med</option>
            <option value="llama-3.2-3b">AI: Llama 3.2</option>
          </select>
        </div>

        {/* Forum - matches your screenshot */}
        <label className={`${pill} cursor-pointer hover:bg-[#1a1f2e] ${useForum? 'border-cyan-900/50' : ''}`}>
          <input type="checkbox" checked={useForum} onChange={e=>setUseForum(e.target.checked)}
            className="w-3.5 h-3.5 rounded-[3px] bg-[#0f121a] border-slate-600 text-cyan-500 focus:ring-0 focus:ring-offset-0" />
          <span>Forum</span>
        </label>

        {/* Kainoa - matches your screenshot */}
        <label className={`${pill} cursor-pointer hover:bg-[#1a1f2e] ${useKainoa? 'border-cyan-900/50' : ''}`}>
          <input type="checkbox" checked={useKainoa} onChange={e=>setUseKainoa(e.target.checked)}
            className="w-3.5 h-3.5 rounded-[3px] bg-[#0f121a] border-slate-600 text-cyan-500 focus:ring-0 focus:ring-offset-0" />
          <span>Kainoa</span>
        </label>
      </div>

      {/* Chat - keep your existing */}
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
