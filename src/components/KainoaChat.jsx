import { useEffect, useRef, useState } from 'react';

export default function KainoaChat() {
  const [answers, setAnswers] = useState([]);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Aloha! I'm Kainoa. Type 'citizenship' to test my instant answers!" }
  ]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState('off');
  const [useForum, setUseForum] = useState(true);
  const [useKainoa, setUseKainoa] = useState(true);
  const msgsRef = useRef(null);
  const base = import.meta.env.BASE_URL;
  const aiEnabled = model !== 'off';

  useEffect(() => { fetch(`${base}responses.json`).then(r=>r.json()).then(setAnswers).catch(()=>{}); }, [base]);
  useEffect(() => { msgsRef.current?.scrollTo({ top: 99999 }); }, [messages]);

  const find = q => answers.find(a => a.keywords?.some(k => q.toLowerCase().includes(k)));
  const send = () => { 
    const q=input.trim(); if(!q) return; 
    setInput(''); 
    setMessages(m=>[...m,{role:'user',text:q}]); 
    const hit=useKainoa&&find(q); 
    setTimeout(()=>setMessages(m=>[...m,{role:'bot',text:hit?hit.answer:"Try 'citizenship'"}]),100); 
  };

  // ONE shared style for all pills
  const pill = "h-9 px-3 flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/70 text-sm hover:bg-slate-800/60 transition-colors";

  const Pill = ({checked, onChange, children}) => (
    <label className={`${pill} w-full md:w-auto cursor-pointer`}>
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-cyan-500" />
      <span className="whitespace-nowrap leading-none">{children}</span>
    </label>
  );

  return (
    <div className="bg-transparent">
      <div className="mb-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          
          {/* AI pill - NOW uses same single wrapper */}
          <div className={`${pill} w-full md:w-[175px] relative !gap-1.5 !pr-7 ${aiEnabled ? 'border-cyan-700/60' : ''}`}>
            <span className={`text-[11px] leading-none shrink-0 ${aiEnabled ? 'text-cyan-400' : 'text-slate-500'}`}>AI:</span>
            <select
              value={model}
              onChange={e=>setModel(e.target.value)}
              className="w-full bg-transparent text-slate-200 outline-none appearance-none cursor-pointer leading-none"
            >
              <option value="off" className="bg-slate-900">Off</option>
              <option value="phi-3.5-mini" className="bg-slate-900">Phi-3.5 Mini</option>
              <option value="phi-3-medium" className="bg-slate-900">Phi-3 Medium</option>
              <option value="llama-3.2-3b" className="bg-slate-900">Llama 3.2 3B</option>
            </select>
            <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" className="text-slate-500"/>
            </svg>
          </div>

          <Pill checked={useForum} onChange={e=>setUseForum(e.target.checked)}>Forum</Pill>
          <Pill checked={useKainoa} onChange={e=>setUseKainoa(e.target.checked)}>Kainoa</Pill>
        </div>
      </div>

      {/* Chat */}
      <div ref={msgsRef} className="mb-3 space-y-3">
        {messages.map((m,i)=>(
          <div key={i} className={`flex ${m.role==='user'?'justify-end':''}`}>
            <div className="max-w-[92%] rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">{m.text}</div>
          </div>
        ))}
      </div>

      <div className="relative">
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}
          placeholder="Ask Kainoa about citizenship..."
          className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3.5 pr-24 outline-none"
        />
        <button onClick={send} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-cyan-600 px-5 py-2 text-sm font-medium">Send</button>
      </div>
    </div>
  );
}