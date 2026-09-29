export const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
export function clean(t){ return String(t).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').replace(/\r\n?/g,'\n').trim(); }
export function applyDict(t, dict=[]){
  for (const [from,to] of dict.slice(0,200)) if (typeof from==='string' && typeof to==='string' && from) t = t.split(from).join(to);
  return t;
}
// Permite só <break time="500ms"/> e <emphasis>…</emphasis> depois de escapar todo o resto.
export function toSsmlBody(t, pause){
  let b = esc(t)
    .replace(/&lt;break time="(\d{1,5})(ms|s)"\s*\/&gt;/g,'<break time="$1$2"/>')
    .replace(/&lt;(\/?)emphasis&gt;/g,'<$1emphasis>');
  return pause>0 ? b.replace(/\n+/g,`<break time="${pause}ms"/>`) : b.replace(/\n+/g,' ');
}
export function chunk(t, max=2500){
  const parts=[]; for (const p of t.split(/\n+/)) {
    if (p.length<=max) { parts.push(p); continue; }
    let cur=''; for (const s of p.split(/(?<=[.!?。！？])\s+/)) { if ((cur+' '+s).length>max && cur){parts.push(cur);cur=s;} else cur=cur?cur+' '+s:s; }
    if (cur) parts.push(cur);
  }
  const out=[]; let cur='';
  for (const p of parts){ if ((cur+'\n'+p).length>max && cur){out.push(cur);cur=p;} else cur=cur?cur+'\n'+p:p; }
  if (cur) out.push(cur); return out;
}
// Une WAV PCM (cabeçalho de 44 bytes) em um único arquivo.
export function mergeWav(bufs){
  const data = Buffer.concat(bufs.map(b=>b.subarray(44))); const h = Buffer.from(bufs[0].subarray(0,44));
  h.writeUInt32LE(36+data.length,4); h.writeUInt32LE(data.length,40); return Buffer.concat([h,data]);
}
