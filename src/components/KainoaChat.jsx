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

  const base = import.meta.env.BASE_URL;

  useEffect(() => {
    if (!navigator.gpu) setAiStatus('AI: mobile not supported');

    Promise.allSettled([
      fetch(`${base}forum-index.json`).then(r => r.ok? r.json() : []),
      fetch(`${base}responses.json`).then(r => r.ok? r.json() : [])
    ]).then(([f, k]) => {
      const forum = f.status === 'fulfilled'? f.value : [];
      const kainoa = k.status === 'fulfilled'? k.value : [];
      setForumIdx(forum);
      setKainoaAnswers(kainoa);
      setIdxStatus(`${forum.length} topics • ${kainoa.length} Kainoa answers`);
    });
  }, [base]);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [messages]);

  const addMessage = (text, user = false) => {
    setMessages(m => [...m, { role: user? 'user' : 'bot', text }]);
  };

  const findKainoa = (q) => {
    if (!useKainoa ||!kainoaAnswers.length) return null;
    const lower = q.toLowerCase();
    return kainoaAnswers.find(item =>
      item.keywords?.some(kw => lower.includes(kw.toLowerCase()))
    );
  };

  const searchForum = (q) => {
    if (!useForum ||!forumIdx.length) return [];
    const terms = q.toLowerCase().split(/\W+/).filter(t => t.length > 2);
    return forumIdx
     .map(i => {
        const txt = (i.title + ' ' + (i.excerpt || '')).toLowerCase();
        const score = terms.reduce((s, t) => s + (txt.includes(t)? 1 : 0), 0);
        return {...i, score };
      })
     .filter(i => i.score > 0)
     .sort((a, b) => b.score - a.score)
     .slice(0, 3);
  };

  const loadAI = async () => {
    if (engineRef.current ||!navigator.gpu) return;
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

    const match = findKainoa(q);
    if (match) {
      addMessage(`🌺 ${match.answer}`);
      const hits = searchForum(q);
      if (hits.length) addMessage('Related:\n' + hits.map(h => `• ${h.title}`).join('\n'));
      return;
    }

    if (useForum &&!useAI) {
      const hits = searchForum(q);
      addMessage(hits.length? hits.map(h => `${h.title}\n${h.url}`).join('\n\n') : 'No forum matches found.');
      return;
    }

    if (useAI && navigator.gpu) {
      await loadAI();
      addMessage('...');
      const stream = await engineRef.current.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are Kainoa, helpful TEP assistant. Be concise.' },
          { role: 'user', content: q }
        ],
        stream: true,
        temperature: 0.3
      });
      let txt = '';
      for await (const chunk of stream) {
        txt += chunk.choices
