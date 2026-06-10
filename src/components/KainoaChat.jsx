import { useEffect, useRef, useState } from 'react';

export default function KainoaChat() {
  const [answers, setAnswers] = useState([]);
  const [messages, setMessages] = useState([{
    role: 'bot',
    text: "Aloha! I'm Kainoa. Type 'citizenship' to test my instant answers!"
  }]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState('off');
  const [useForum, setUseForum] = useState(true);
  const [useKainoa, setUseKainoa] = useState(true);
  const [aiOpen, setAiOpen] = useState(false);
  const msgsRef = useRef(null);
  const aiRef = useRef(null);
  const base = import.meta.env.BASE_URL;

  // load answers
  useEffect(() => {
    fetch(`${base}responses.json`).then(r => r.json()).then(setAnswers).catch(() => {});
  }, [base]);

  // auto-scroll
  useEffect(() => {
    msgsRef.current?.scrollTo({ top: 99999 });
  }, [messages]);

  // close AI dropdown on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (aiRef.current &&!aiRef.current.contains(e.target)) setAiOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const find = q => answers.find(a => a.keywords?.some(k => q.toLowerCase().includes(k)));

  const send = () => {
    const q = input.trim();
    if (!q) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text: q }]);
    const hit = useKainoa && find(q);
    setTimeout(() => setMessages(m => [...m, {
      role: 'bot',
      text: hit? hit.answer : "Try 'citizenship'"
    }]), 100);
  };

  const models = [
    { id: 'off', label: 'AI: Off' },
    { id: 'phi-3.5-mini', label: 'AI: Phi-3.5' },
    { id: 'phi-3-medium', label: 'AI: Phi-3 Med' },
    { id: 'llama-3.2-3b', label: 'AI: Llama 3.2' },
  ];

  // === HARD RESET ===
  // all: unset wipes any global button/input styles that cause the 2px drift
  const pillReset = {
    all: 'unset',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    height: '28px',
    lineHeight: '1',
  };

  const basePill = "px-2.5 gap-1.5 rounded-lg border text-[12px] select-none cursor-pointer";
  const pillIdle = "border-slate-700/40 bg-[#141722] text-slate-300 hover:bg-[#1a1f2e]";
  const pillActive = "border-cyan-800/60 bg-[#141722] text-cyan-300";

  return (
    <div className="bg-transparent" style={{ isolation: 'isolate' }}>
      {/* CONTROLS */}
      <div className="mb-4 flex flex-col gap-2">

        {/* Row 1: AI — own row, no shared baseline */}
        <div className="relative w-full sm:w-[180px]" ref={aiRef}>
          <div
            role="button"
            tabIndex={0}
            onClick={() => setAiOpen(o =>!o)}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setAiOpen(o =>!o)}
            style={pillReset}
            className={`${basePill} w-full justify-between pr-6 ${model!== 'off'? pillActive : pillIdle}`}
          >
            <span className="truncate">{models.find(m => m.id === model)?.label}</span>
            <svg className="absolute right-2 pointer-events-none" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5a6378" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>

          {aiOpen && (
            <div className="absolute z-20 mt-1 w-full rounded-lg border border-slate-700/60 bg-[#0f131c] shadow-xl overflow-hidden py-1">
              {models.map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => { setModel(m.id); setAiOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-[#1a1f2e] ${model === m.id? 'text-cyan-300 bg-[#141722]' : 'text-slate-300'}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Row 2: Forum + Kainoa — grid locks both to identical 28px track */}
        <div className="grid grid-cols-[auto_auto] items-center gap-2 w-fit">
          {[
            { key: 'forum', active: useForum, toggle: () => setUseForum(v =>!v), label: 'Forum' },
            { key: 'kainoa', active: useKainoa, toggle: () => setUseKainoa(v =>!v), label: 'Kainoa' },
          ].map(p => (
            <div
              key={p.key}
              role="button"
              tabIndex={0}
              onClick={p.toggle}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && p.toggle()}
              style={pillReset}
              className={`${basePill} ${p.active? pillActive : pillIdle}`}
            >
              <span className={`w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center shrink-0 ${p.active? 'bg-cyan-500 border-cyan-500' : 'bg-[#0f121a] border-slate-600'}`}>
                {p.active && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                    <path d="M5 13l4 4 10-10" />
                  </svg>
                )}
              </span>
              <span>{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT */}
      <div ref={msgsRef} className="mb-3 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user'? 'justify-end' : ''}`}>
            <div className="max-w-[92%] rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-[14px] leading-relaxed text-slate-200">
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div className="relative">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask Kainoa about citizenship..."
          className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3.5 pr-24 text-[14px] text-slate-100 placeholder-slate-500 outline-none focus:ring-1 focus:ring-cyan-900/50"
        />
        <button
          onClick={send}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-cyan-600 px-5 py-2 text-sm font-medium text-white hover:bg-cyan-500 active:bg-cyan-700 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
