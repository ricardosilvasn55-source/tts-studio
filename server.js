import 'dotenv/config';
import express from 'express'; import cors from 'cors'; import helmet from 'helmet'; import rateLimit from 'express-rate-limit';
import path from 'node:path'; import { fileURLToPath } from 'node:url'; import fs from 'node:fs';
import { VOICES } from './voices.js'; import { getProvider } from './providers/index.js';
import { clean, applyDict, chunk, mergeWav } from './utils/text.js';

const app = express(); const MAX = +process.env.MAX_CHARS || 20000;
if (!process.env.TTS_API_KEY) console.warn('⚠ TTS_API_KEY não definida: a geração vai falhar.');
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy:false }));
app.use(cors({ origin:process.env.ALLOWED_ORIGIN || true, exposedHeaders:['X-Duration'] }));
app.use(express.json({ limit:'300kb' }));
app.use('/api', rateLimit({ windowMs:60_000, limit:20, message:{ error:'Muitas requisições. Aguarde um minuto.' } }));

const num = (v,min,max,d) => Number.isFinite(+v) ? Math.min(max,Math.max(min,Math.round(+v))) : d;
app.get('/api/voices', (_q,res) => res.json({ voices:VOICES, maxChars:MAX }));

app.post('/api/tts', async (req,res) => {
  try {
    const b = req.body || {}; const voice = VOICES.find(v => v.id === b.voice);
    if (!voice) return res.status(400).json({ error:'Voz inválida.' });
    if (typeof b.text !== 'string') return res.status(400).json({ error:'Texto obrigatório.' });
    const p = getProvider(); const format = b.format === 'wav' ? 'wav' : 'mp3';
    const text = applyDict(clean(b.text), Array.isArray(b.dict) ? b.dict : []);
    if (!text) return res.status(400).json({ error:'O texto está vazio.' });
    if (text.length > MAX) return res.status(400).json({ error:`Limite de ${MAX} caracteres excedido.` });
    const o = { voice:voice.id, locale:voice.locale, format, rate:num(b.rate,-50,100,0), pitch:num(b.pitch,-50,50,0),
                volume:num(b.volume,-50,50,0), pause:num(b.pause,0,3000,400) };
    const bufs = []; for (const c of chunk(text)) bufs.push(await p.synthesize({ ...o, text:c })); // mesma voz/config em todos os blocos
    const audio = format === 'wav' ? mergeWav(bufs) : Buffer.concat(bufs);
    res.set({ 'Content-Type':p.formats[format].mime, 'X-Duration':String(audio.length / p.formats[format].bps) }).send(audio);
  } catch (e) {
    console.error(e.message);
    res.status(e.status === 401 || e.status === 403 ? 502 : 500).json({ error: e.status === 401 || e.status === 403 ? 'Chave do provedor TTS inválida ou sem permissão.' : 'Falha ao gerar o áudio. Tente novamente.' });
  }
});

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../frontend/dist');
if (fs.existsSync(dist)) { app.use(express.static(dist)); app.get('*', (_q,res) => res.sendFile(path.join(dist,'index.html'))); }
app.listen(process.env.PORT || 3001, () => console.log('TTS Studio em http://localhost:' + (process.env.PORT || 3001)));
