import { useEffect, useMemo, useState } from 'react';
type Voice = { id:string; name:string; gender:string; locale:string; lang:string; region:string; style:string; desc:string };
type S = { rate:number; pitch:number; volume:number; pause:number };
type Hist = { id:number; text:string; voice:string; lang:string; date:string; dur:number; s:S };
type Audio = { url:string; fmt:'mp3'|'wav'; dur:number };
const PRESETS: Record<string,S> = { Natural:{rate:0,pitch:0,volume:0,pause:400}, Jornalístico:{rate:8,pitch:-2,volume:0,pause:300},
  Documentário:{rate:-8,pitch:-4,volume:0,pause:700}, 'Notícia urgente':{rate:18,pitch:2,volume:10,pause:150}, Institucional:{rate:-3,pitch:-1,volume:0,pause:500},
  Publicidade:{rate:10,pitch:4,volume:10,pause:250}, YouTube:{rate:8,pitch:3,volume:5,pause:250}, Podcast:{rate:0,pitch:-1,volume:0,pause:450},
  Dramático:{rate:-15,pitch:-6,volume:0,pause:900}, Calmo:{rate:-15,pitch:-3,volume:-5,pause:800}, Emocional:{rate:-10,pitch:2,volume:0,pause:700} };
const SAMPLE: Record<string,string> = { pt:'Olá! Esta é uma demonstração da minha voz.', en:'Hello! This is a demonstration of my voice.', es:'¡Hola! Esta es una demostración de mi voz.',
  fr:'Bonjour ! Ceci est une démonstration de ma voix.', de:'Hallo! Das ist eine Demonstration meiner Stimme.', it:'Ciao! Questa è una dimostrazione della mia voce.',
  ja:'こんにちは。これは私の声のデモです。', ko:'안녕하세요. 제 목소리 데모입니다.' };
function useLS<T>(k:string, init:T){ const [v,setV] = useState<T>(() => { try { return JSON.parse(localStorage.getItem(k) || '') as T; } catch { return init; } });
  useEffect(() => { localStorage.setItem(k, JSON.stringify(v)); }, [k,v]); return [v,setV] as const; }
async function synth(text:string, voice:string, s:S, format:string, dict:string[][]){
  const r = await fetch('/api/tts', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ text, voice, format, dict, ...s }) });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'Erro ao gerar o áudio.');
  return { blob:await r.blob(), dur:+(r.headers.get('X-Duration') || 0) };
}
const save = (blob:Blob, name:string) => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); };
const fmt = (s:number) => `${Math.floor(s/60)}:${String(Math.round(s%60)).padStart(2,'0')}`;

export default function App(){
  const [voices,setVoices] = useState<Voice[]>([]); const [maxChars,setMax] = useState(20000);
  const [view,setView] = useState<'tts'|'hist'|'favs'|'dict'>('tts');
  const [text,setText] = useLS('text',''); const [voiceId,setVoiceId] = useLS('voice','pt-BR-FranciscaNeural');
  const [s,setS] = useLS<S>('s',PRESETS.Natural); const [dict,setDict] = useLS<string[][]>('dict',[['João Pessoa','João Pessôa']]);
  const [hist,setHist] = useLS<Hist[]>('hist',[]); const [favs,setFavs] = useLS<string[]>('favs',[]); const [dark,setDark] = useLS('dark',true);
  const [q,setQ] = useState(''); const [fl,setFl] = useState(''); const [fg,setFg] = useState('');
  const [loading,setLoading] = useState<string>(''); const [err,setErr] = useState(''); const [audio,setAudio] = useState<Audio|null>(null); const [speed,setSpeed] = useState(1);
  const [df,setDf] = useState(''); const [dt,setDt] = useState('');
  useEffect(() => { fetch('/api/voices').then(r => r.json()).then(d => { setVoices(d.voices); setMax(d.maxChars); }).catch(() => setErr('Não foi possível conectar ao servidor.')); }, []);
  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; }, [dark]);
  const voice = voices.find(v => v.id === voiceId);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const list = useMemo(() => voices.filter(v => (view!=='favs' || favs.includes(v.id)) && (!fl || v.lang===fl) && (!fg || v.gender===fg) &&
    `${v.name} ${v.style} ${v.desc} ${v.region}`.toLowerCase().includes(q.toLowerCase())), [voices,q,fl,fg,favs,view]);
  const run = async (label:string, fn:() => Promise<void>) => { setErr(''); setLoading(label); try { await fn(); } catch (e:any) { setErr(e.message); } setLoading(''); };
  const generate = () => run('Gerando voz…', async () => {
    const { blob, dur } = await synth(text, voiceId, s, 'mp3', dict); setAudio({ url:URL.createObjectURL(blob), fmt:'mp3', dur });
    setHist([{ id:Date.now(), text, voice:voiceId, lang:voice?.locale || '', date:new Date().toLocaleString('pt-BR'), dur, s }, ...hist].slice(0,50)); });
  const demo = (v:Voice) => run('Carregando demonstração…', async () => { const { blob } = await synth(SAMPLE[v.locale.slice(0,2)], v.id, PRESETS.Natural, 'mp3', []); new Audio(URL.createObjectURL(blob)).play(); });
  const download = (f:'mp3'|'wav') => run(`Preparando ${f.toUpperCase()}…`, async () => { const { blob } = await synth(text, voiceId, s, f, dict); save(blob, `voz.${f}`); });
  const load = (h:Hist) => { setText(h.text); setVoiceId(h.voice); setS(h.s); setView('tts'); };
  const slider = (k:keyof S, label:string, min:number, max:number, step:number, unit:string) =>
    <label className="sl"><span>{label}<b>{s[k]}{unit}</b></span><input type="range" min={min} max={max} step={step} value={s[k]} onChange={e => setS({ ...s, [k]:+e.target.value })}/></label>;
  const nav: [typeof view,string][] = [['tts','Texto para voz'],['favs','Vozes favoritas'],['hist','Histórico'],['dict','Pronúncia']];
  return <div className="app">
    <aside><h1>TTS Studio</h1>{nav.map(([k,l]) => <button key={k} className={view===k ? 'on' : ''} onClick={() => setView(k)}>{l}</button>)}
      <button className="mode" onClick={() => setDark(!dark)}>{dark ? 'Modo claro' : 'Modo escuro'}</button></aside>
    <main>
      {err && <div className="err" role="alert">{err}</div>}
      {view==='tts' && <section className="card">
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Digite ou cole o texto. Use <break time=&quot;500ms&quot;/> e <emphasis>palavra</emphasis> para controlar pausas e ênfase." />
        <div className="meta"><span>{text.length}/{maxChars} caracteres</span><span>{words} palavras</span><span>≈ {fmt(words / 2.6)} de áudio</span>
          <button className="ghost" onClick={() => setText('')}>Limpar</button></div>
        <div className="presets">{Object.keys(PRESETS).map(p => <button key={p} className="chip" onClick={() => setS(PRESETS[p])}>{p}</button>)}</div>
        <div className="sliders">{slider('rate','Velocidade',-50,100,1,'%')}{slider('pitch','Pitch',-50,50,1,'%')}{slider('volume','Volume',-50,50,1,'%')}{slider('pause','Pausa entre parágrafos',0,3000,50,'ms')}</div>
        <button className="go" disabled={!!loading || !text.trim() || text.length>maxChars} onClick={generate}>{loading || `GERAR VOZ${voice ? ' · ' + voice.name : ''}`}</button>
      </section>}
      {view==='hist' && <section className="card"><h2>Histórico</h2>{!hist.length && <p className="empty">Nenhuma geração ainda. Gere uma voz e ela aparece aqui.</p>}
        {hist.map(h => <div className="row" key={h.id}><div><b>{h.voice.split('-')[2].replace('Neural','')}</b> · {h.date} · {fmt(h.dur)}<p>{h.text.slice(0,140)}</p></div>
          <button className="ghost" onClick={() => load(h)}>Duplicar</button><button className="ghost" onClick={() => setHist(hist.filter(x => x.id!==h.id))}>Excluir</button></div>)}</section>}
      {view==='dict' && <section className="card"><h2>Dicionário de pronúncia</h2><p className="empty">Substitui o termo pelo texto de pronúncia antes de gerar.</p>
        {dict.map(([a,b],i) => <div className="row" key={i}><span>{a} → {b}</span><button className="ghost" onClick={() => setDict(dict.filter((_,j) => j!==i))}>Remover</button></div>)}
        <div className="row"><input placeholder="Termo" value={df} onChange={e => setDf(e.target.value)}/><input placeholder="Pronúncia" value={dt} onChange={e => setDt(e.target.value)}/>
          <button onClick={() => { if (df && dt) { setDict([...dict,[df,dt]]); setDf(''); setDt(''); } }}>Adicionar</button></div></section>}
      {(view==='favs') && !list.length && <section className="card"><p className="empty">Nenhuma voz favorita. Marque uma estrela na biblioteca ao lado.</p></section>}
    </main>
    <aside className="voices"><h2>Vozes</h2>
      <input placeholder="Buscar voz…" value={q} onChange={e => setQ(e.target.value)}/>
      <div className="flt"><select value={fl} onChange={e => setFl(e.target.value)}><option value="">Idioma</option>{[...new Set(voices.map(v => v.lang))].map(l => <option key={l}>{l}</option>)}</select>
        <select value={fg} onChange={e => setFg(e.target.value)}><option value="">Gênero</option><option>Masculina</option><option>Feminina</option></select></div>
      <div className="vl">{list.map(v => <div key={v.id} className={'v' + (v.id===voiceId ? ' sel' : '')} onClick={() => setVoiceId(v.id)}>
        <div><b>{v.name}</b> <small>{v.gender} · {v.style}</small><p>{v.lang} · {v.region} — {v.desc}</p></div>
        <div className="vb"><button aria-label="Favoritar" onClick={e => { e.stopPropagation(); setFavs(favs.includes(v.id) ? favs.filter(f => f!==v.id) : [...favs,v.id]); }}>{favs.includes(v.id) ? '★' : '☆'}</button>
          <button onClick={e => { e.stopPropagation(); demo(v); }}>Ouvir</button></div></div>)}</div></aside>
    <footer>{audio ? <>
      <audio key={audio.url} src={audio.url} controls ref={el => { if (el) el.playbackRate = speed; }} autoPlay/>
      <select aria-label="Velocidade de reprodução" value={speed} onChange={e => setSpeed(+e.target.value)}>{[0.75,1,1.25,1.5,2].map(x => <option key={x} value={x}>{x}x</option>)}</select>
      <button onClick={() => download('mp3')} disabled={!!loading}>Baixar MP3</button><button onClick={() => download('wav')} disabled={!!loading}>Baixar WAV</button></>
      : <span className="empty">O player aparece aqui depois de gerar a voz.</span>}</footer>
  </div>;
}
