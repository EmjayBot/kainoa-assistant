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
  const [model, setModel] = useState('phi-3.5-mini');
  const msgsRef = useRef(null);
  const base = import.meta.env.BASE_URL;

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

  // Responsive control - full width mobile, auto desktop
  const Control = ({checked, onChange, children}) => (
    <label className="
      flex cursor-pointer items-center gap-2.5
      rounded-xl border border-slate-700/60 bg-slate-900/70 
      px-3 py-2.5 text-sm hover:bg-slate-800/60
      w-full md:w-auto
    ">
      <input type="checkbox" checked={checked} onChange={onChange} 
        className="h-4 w-4 shrink-0 rounded border-slate-600 bg-slate-800 accent-cyan-500" />
      <span className="whitespace-nowrap text-slate-200">{children}</span>
    </label>
  );

  return (
    <div className="bg-transparent">
      {/* Controls - responsive */}
      <div className="mb-4">
        <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center">
          {/* Model picker - ready for multiple AIs */}
          <div className="relative w-full md:w-auto">
            <select 
              value={model} 
              onChange={e=>setModel(e.target.value)}
              className="
                w-full appearance-none rounded-xl border border-slate-700/60 
                bg-slate-900/70 px-3 py-2.5 pr-8 text-sm text-slate-300
                hover:bg-slate-800/60 focus:outline-none focus:ring-1 focus:ring-cyan-600
                md:w-[160px]
              "
            >
              <option value="phi-3.5-mini">Phi-3.5 Mini</option>
              <option value="phi-3-medium">Phi-3 Medium</option>
              <option value="llama-3.2-3b">Llama 3.2 3B</option>
            </select>
            <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>
          
          <Control checked={useAI} onChange={e=>setUseAI(e.target.checked)}>AI</Control>
          <Control checked={useForum} onChange={e=>setUseForum(e.target.checked)}>Forum</Control>
          <Control checked={useKainoa} onChange={e=>setUseKainoa(e.target.checked)}>Kainoa</Control>
        </div>
      </div>

      {/* Chat */}
      <div ref={msgsRef} className="mb-3 space-y-3">
        {messages.map((m,i)=>(
          <div key={i} className={`flex ${m.role==='user'?'justify-end':''}`}>
            <div className="max-w-[92%] rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text- leading-relaxed">
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="relative">
        <input 
          value={input} 
          onChange={e=>setInput(e.target.value)} 
          onKeyDown={e=>e.key==='Enter'&&send()}
          placeholder="Ask Kainoa about citizenship..."
          className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3.5 pr-24 text- outline-none placeholder:text-slate-500 focus:border-cyan-800"
        />
        <button 
          onClick={send} 
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-cyan-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-cyan-500"
        >
          Send
        </button>
      </div>
    </div>
  );
}