import { useEffect, useRef, useState } from 'react';

export default function KainoaChat() {
  const [forumIdx, setForumIdx] = useState([]);
  const [kainoaAnswers, setKainoaAnswers] = useState([]);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Aloha! I'm Kainoa. Type 'citizenship' to test my instant answers." }
  ]);
  const [input, setInput] = useState('');
  const [useAI, setUseAI] = useState(false);
  const [useForum, setUseForum] = useState(true);
  const [useKainoa, setUseKainoa] = useState(true);
  const [aiStatus, setAiStatus] = useState('AI: off');
  const [idxStatus, setIdxStatus] = useState('Loading data…');
  const engineRef = useRef(null);
  const msgsRef = useRef(null);

  useEffect(() => {
    Promise.allSettled([
      fetch('/forum-index.json').then(r => r.ok ? r.json() : []),
      fetch('/responses.json').then(r => r.ok ? r.json() : [])
    ]).then(([f, k]) => {
      const forum = f.status === 'fulfilled' ? f.value : [];
      const kainoa = k.status === 'fulfilled' ? k.value : [];
      setForumIdx(forum);
      setKainoaAnswers(kainoa);
      setIdxStatus(`${forum.length} topics • ${kainoa.length} Kainoa answers`);
    });
  }, []);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [messages]);

  const addMessage = (text, user = false) => {
    setMessages(m => [...m, { role: user ? 'user' : 'bot', text }]);
  };

  const findKainoa = (q) => {
    if (!useKainoa || !kainoaAnswers.length) return null;
    const lower = q.toLowerCase();
    return kainoaAnswers.find(item => 
      item.keywords?.some(kw => lower.includes(kw.toLowerCase()))
    );
  };

  const searchForum = (q) => {
    if (!useForum || !forumIdx.length) return [];
    const terms = q.toLowerCase().split(/\W+/).filter(t => t.length > 2);
    return forumIdx
      .map(i => {
        const txt = (i.title + ' ' + (i.excerpt || '')).toLowerCase();
        const score = terms.reduce((s, t) => s + (txt.includes(t) ? 1 : 0), 0);
        return { ...i, score };
      })
      .filter(i => i.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  };

  const loadAI = async () => {
    if (engineRef.current) return;
    setAiStatus('AI: loading…');
    const { CreateMLCEngine } = await import('@mlc-ai/web-llm');
    const engine = await CreateMLCEngine('Phi-3.5-mini-instruct-q4f16_1-MLC', {
      initProgressCallback: (p) => setAiStatus(`AI: ${Math.round(p.progress * 100)}%`)
    });
    engineRef.current = engine;
    setAiStatus('AI: ready');
  };

  const handleSend = async () => {
    const q = input.trim();
    if (!q) return;
    setInput('');
    addMessage(q, true);

    // 1. Kainoa answers first
    const match = findKainoa(q);
    if (match) {
      addMessage(`🌺 ${match.answer}`);
      const hits = searchForum(q);
      if (hits.length) addMessage('Related:\n' + hits.map(h => `• ${h.title}`).join('\n'));
      return;
    }

    // 2. Forum only
    if (useForum && !useAI) {
      const hits = searchForum(q);
      addMessage(hits.length ? hits.map(h => `${h.title}\n${h.url}`).join('\n\n') : 'No forum matches found.');
      return;
    }

    // 3. AI
    if (useAI) {
      await loadAI();
      const hits = searchForum(q);
      let prompt = q;
      if (hits.length) prompt += '\n\nContext:\n' + hits.map(h => `${h.title} - ${h.url}`).join('\n');
      
      addMessage('...'); 
      const idx = messages.length + 1;
      const stream = await engineRef.current.chat.completions.create({
        messages: [{ role: 'system', content: 'You are Kainoa, helpful TEP assistant. Be concise.' }, { role: 'user', content: prompt }],
        stream: true,
        temperature: 0.3
      });
      let txt = '';
      for await (const chunk of stream) {
        txt += chunk.choices[0]?.delta?.content || '';
        setMessages(m => {
          const copy = [...m];
          copy[copy.length - 1] = { role: 'bot', text: txt };
          return copy;
        });
      }
      return;
    }

    addMessage('Enable Kainoa, Forum, or AI above.');
  };

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-black text-xs">K</div>
          <div>
            <div className="text-sm font-semibold">Kainoa Controls</div>
            <div className="text-[11px] text-slate-400">{idxStatus} • {aiStatus}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={useAI} onChange={e => setUseAI(e.target.checked)} className="accent-cyan-500" /> AI</label>
          <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={useForum} onChange={e => setUseForum(e.target.checked)} className="accent-cyan-500" /> Forum</label>
          <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={useKainoa} onChange={e => setUseKainoa(e.target.checked)} className="accent-cyan-500" /> Kainoa</label>
        </div>
      </div>

      {/* Chat */}
      <div ref={msgsRef} className="h-[60vh] overflow-y-auto space-y-3 p-4 rounded-2xl bg-slate-950/50 border border-slate-800 mb-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[14px] whitespace-pre-wrap ${m.role === 'user' ? 'bg-cyan-600/20 border border-cyan-500/30' : 'bg-slate-900 border border-slate-800'}`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input - fixed, no overlap */}
      <div className="flex items-end gap-2 p-2 rounded-2xl bg-slate-900/70 border border-slate-800">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Ask Kainoa about citizenship…"
          rows={1}
          className="flex-1 bg-transparent outline-none resize-none max-h-32 text-sm px-2 py-1.5 placeholder-slate-500 leading-6"
          style={{ fieldSizing: 'content' }}
        />
        <button onClick={handleSend} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-xs font-medium transition">Send</button>
      </div>
    </div>
  );
}
