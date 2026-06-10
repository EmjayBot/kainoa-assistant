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
  const [model, setModel] = useState('Phi-3.5 Mini');
  const msgsRef = useRef(null);
  const base = import.meta.env.BASE_URL;

  useEffect(() => {
    fetch(`${base}responses.json`).then(r=>r.json()).then(setAnswers).catch(()=>{});
  }, [base]);

  useEffect(() => { msgsRef.current?.scrollTo({ top: 99999, behavior: 'smooth' }); }, [messages]);

  const find = q => answers.find(a => a.keywords?.some(k => q.toLowerCase().includes(k)));

  const send = () => {
    const q = input.trim(); if (!q) return;
    setInput('');
    setMessages(m => [...m, {role:'user', text:q}]);
    const hit = useKainoa && find(q);
    setTimeout(()=> setMessages(m=>[...m, {role:'bot', text: hit? hit.answer : "Try 'citizenship', 'amendments', or 'roster'"}]), 100);
  };

  const Pill = ({checked, onChange, children}) => (
    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-sm backdrop-blur">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-cyan-500" />
      <span className="text-slate-200">{children}</span>
    </label>
  );

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200">
      {/* HEADER - exact match to your screenshot */}
      <header className="sticky top-0 z-20 border-b border-slate-800/60 bg-[#070b14]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-8 place-items-center rounded-xl bg-gradient-to-b from-cyan-400 to-blue-600 font-bold text-white shadow-lg">K</div>
            <div className="leading-tight">
              <div className="text-[22px] font-semibold">Kainoa</div>
              <div className="text- text-slate-400">TEP</div>
              <div className="text- text-slate-500">Community Assistant</div>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2 overflow-x-auto">
            <button className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-sm">
              {model}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 15l-6-6-6 6"/></svg>
            </button>
            <Pill checked={useAI} onChange={e=>setUseAI(e.target.checked)}>AI</Pill>
            <Pill checked={useForum} onChange={e=>setUseForum(e.target.checked)}>Forum</Pill>
            <Pill checked={useKainoa} onChange={e=>setUseKainoa(e.target.checked)}>Kainoa</Pill>
          </div>
        </div>
      </header>

      {/* CHAT */}
      <main className="mx-auto w-full max-w-3xl px-4 py-6">
        <div ref={msgsRef} className="mb-4 space-y-4">
          {messages.map((m,i)=>(
            <div key={i} className={`flex ${m.role==='user'?'justify-end':''}`}>
              <div className="max-w-[90%] rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-4 text- leading-relaxed shadow-sm">
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div className="relative">
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}
            placeholder="Ask Kainoa about citizenship..."
            className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-4 pr-24 text- outline-none placeholder:text-slate-500 focus:border-cyan-800"/>
          <button onClick={send} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-cyan-600 px-5 py-2 text-sm font-medium text-white hover:bg-cyan-500">
            Send
          </button>
        </div>
      </main>

      {/* INFO SECTIONS - from your screenshot */}
      <section className="mx-auto w-full max-w-3xl border-t border-slate-800/60 px-4 py-10">
        <h2 className="mb-3 text-lg font-semibold">How Kainoa works</h2>
        <p className="text- leading-relaxed text-slate-400">
          Kainoa has three brains: <strong className="text-slate-200">Kainoa</strong> answers instantly from your <code>responses.json</code>. <strong className="text-slate-200">Forum</strong> searches your local <code>forum-index.json</code>. <strong className="text-slate-200">AI</strong> runs Phi-3.5 in your browser — nothing leaves your device.
        </p>

        <h3 className="mb-2 mt-8 text-base font-semibold">Powered by</h3>
        <ul className="space-y-1 text- text-slate-400">
          <li>• WebLLM + MLC (local AI)</li>
          <li>• forum.theeastpacific.com</li>
          <li>• 100% client-side</li>
        </ul>

        <h3 className="mb-3 mt-8 text-base font-semibold">TEP Links</h3>
        <div className="grid grid-cols-2 gap-2 text- text-slate-300">
          <a href="https://forum.theeastpacific.com" className="hover:text-cyan-400">Forum</a>
          <a href="https://www.nationstates.net/region=the_east_pacific" className="hover:text-cyan-400">Region</a>
          <a href="#" className="hover:text-cyan-400">Discord</a>
          <a href="#" className="hover:text-cyan-400">Wiki</a>
          <a href="#" className="hover:text-cyan-400">Concordat</a>
          <a href="https://forum.theeastpacific.com/t/citizenship-application" className="hover:text-cyan-400">Apply</a>
        </div>
      </section>

      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
        Kainoa v1.1 • Built for The East Pacific
      </footer>
    </div>
  );
}