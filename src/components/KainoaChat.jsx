import { useEffect, useRef, useState } from 'react';

const FORUM = 'https://forum.theeastpacific.com';

export default function KainoaChat() {
  const [answers, setAnswers] = useState([]);
  const [messages, setMessages] = useState([{role:'bot',text:"Aloha! Forum search is in debug mode."}]);
  const [input, setInput] = useState('');
  const [useKainoa, setUseKainoa] = useState(false);
  const [useForum, setUseForum] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const msgsRef = useRef(null);
  const base = import.meta.env.BASE_URL;

  useEffect(() => {
    fetch(`${base}data/responses/index.json`).then(r=>r.json()).then(m=>Promise.all(m.map(f=>fetch(`${base}data/responses/${f}`).then(r=>r.json())))).then(a=>setAnswers(a.flat())).catch(()=>{});
  }, [base]);

  const searchForumDebug = (q) => {
    return new Promise((resolve) => {
      const cb = `dbg_${Date.now()}`;
      const url = `${FORUM}/search.json?q=${encodeURIComponent(q)}&callback=${cb}`;
      
      window[cb] = (data) => {
        delete window[cb];
        document.getElementById(cb)?.remove();
        resolve({
          success: true,
          url,
          topicsFound: data?.topics?.length || 0,
          topics: (data?.topics || []).slice(0,3).map(t => t.title)
        });
      };

      const s = document.createElement('script');
      s.id = cb;
      s.src = url;
      s.onerror = () => resolve({ success: false, url, error: 'Script blocked by browser or CSP' });
      document.head.appendChild(s);

      setTimeout(() => {
        if (window[cb]) {
          delete window[cb];
          s.remove();
          resolve({ success: false, url, error: 'Timeout after 8s - Discourse did not respond' });
        }
      }, 8000);
    });
  };

  const send = async () => {
    const q = input.trim(); if (!q) return;
    setInput('');
    setMessages(m => [...m, {role:'user', text:q}]);
    setIsSearching(true);

    setMessages(m => [...m, {role:'bot', text:`Testing Forum...`, source:'Debug'}]);
    const result = await searchForumDebug(q);
    setIsSearching(false);

    // Show debug info in chat
    let debugText = `<b>URL tried:</b><br><code style="font-size:11px">${result.url}</code><br><br>`;
    
    if (result.success) {
      debugText += `<b>✓ Discourse responded</b><br>Topics found: ${result.topicsFound}<br><br>`;
      if (result.topicsFound > 0) {
        debugText += `<b>First results:</b><br>• ${result.topics.join('<br>• ')}`;
      } else {
        debugText += `Discourse returned 0 topics for "${q}". Try searching "magisterium" instead.`;
      }
    } else {
      debugText += `<b>✗ Failed:</b> ${result.error}`;
    }

    setMessages(m => [...m.slice(0,-1), {role:'bot', text: debugText, source:'Forum Debug'}]);
  };

  return (
    <div style={{fontFamily:"'Lexend',sans-serif",padding:16,maxWidth:600,margin:'0 auto'}}>
      <div style={{background:'#0f172a',padding:12,borderRadius:8,marginBottom:16,fontSize:13,color:'#94a3b8'}}>
        Debug mode: every search shows what Discourse returns
      </div>
      
      <div style={{height:'60vh',overflowY:'auto',marginBottom:16}}>
        {messages.map((m,i)=>(
          <div key={i} style={{marginBottom:16,textAlign:m.role==='user'?'right':'left'}}>
            <div style={{display:'inline-block',maxWidth:'90%',background:m.role==='user'?'#1e293b':'#111827',padding:'12px 16px',borderRadius:12,textAlign:'left',color:'#e2e8f0'}} dangerouslySetInnerHTML={{__html:m.text}}/>
          </div>
        ))}
      </div>

      <div style={{display:'flex',gap:8}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Try 'magister'" disabled={isSearching} style={{flex:1,padding:12,background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'white'}}/>
        <button onClick={send} disabled={isSearching} style={{padding:'12px 20px',background:'#0ea5e9',color:'white',border:'none',borderRadius:8}}>{isSearching?'...':'Test'}</button>
      </div>
    </div>
  );
}