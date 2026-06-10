import { useEffect, useRef, useState } from 'react';

export default function KainoaChat() {
  const [answers, setAnswers] = useState([]);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Aloha! I'm Kainoa. Type 'citizenship' to test my instant answers from responses.json" }
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

  const Pill = ({checked, onChange, children}) => (
    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-sm">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 accent-cyan-500" />
      <span>{children}</span>
    </label>
  );

  return (
    <div className="bg-[#070b14]">
      <header className="sticky top-0 z-20 border-b border-slate-800/60 bg-[#070b14]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-8 place-items-center rounded-xl bg-gradient-to-b from-cyan-400 to-blue-600 font-bold">K</div>
            <div className="leading-tight">
              <div className="font-semibold">Kainoa</div>
              <div className="text-xs text-slate-400">TEP</div>
              <div className="text-xs text-slate-500">Community Assistant</div>
            </div>
          </div>
          <div className="ml-auto flex gap-2">
            <button className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-sm">Phi-3.5 Mini</button>
            <Pill checked={useAI} onChange={e=>setUseAI(e.target.checked)}>AI</Pill>
            <Pill checked={useForum} onChange={e=>setUseForum(e.target.checked)}>Forum</Pill>
            <Pill checked={useKainoa} onChange={e=>setUseKainoa(e.target.checked)}>Kainoa</Pill>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-6">
        <div ref={msgsRef} className="mb-4 space-y-4">
          {messages.map((m,i)=>(
            <div key={i} className={`flex ${m.role==='user'?'justify-end':''}`}>
              <div className="max-w-[90%] rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-4">{m.text}</div>
            </div>
          ))}
        </div>
        <div className="relative">
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}
            placeholder="Ask Kainoa about citizenship..."
            className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-4 pr-24 outline-none"/>
          <button onClick={send} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-cyan-600 px-5 py-2 text-sm">Send</button>
        </div>
      </main>
    </div>
  );
}