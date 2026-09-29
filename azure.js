// Provedor A: Azure AI Speech (REST /cognitiveservices/v1, corpo SSML).
import { toSsmlBody } from '../utils/text.js';
const FORMATS = { mp3:{header:'audio-24khz-96kbitrate-mono-mp3',mime:'audio/mpeg',bps:12000},
                  wav:{header:'riff-24khz-16bit-mono-pcm',mime:'audio/wav',bps:48000} };
const pct = n => `${n>=0?'+':''}${n}%`;
export default {
  name:'azure', formats:FORMATS,
  async synthesize({ text, voice, locale, rate, pitch, volume, pause, format }){
    const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${locale}">`+
      `<voice name="${voice}"><prosody rate="${pct(rate)}" pitch="${pct(pitch)}" volume="${pct(volume)}">${toSsmlBody(text,pause)}</prosody></voice></speak>`;
    const r = await fetch(process.env.TTS_API_URL, { method:'POST', headers:{
      'Ocp-Apim-Subscription-Key':process.env.TTS_API_KEY, 'Content-Type':'application/ssml+xml',
      'X-Microsoft-OutputFormat':FORMATS[format].header, 'User-Agent':'tts-studio' }, body:ssml });
    if (!r.ok) { const e = new Error(`Provedor TTS respondeu ${r.status}`); e.status = r.status; throw e; }
    return Buffer.from(await r.arrayBuffer());
  }
};
// Para adicionar outro provedor (ex.: ElevenLabs): crie providers/outro.js com a mesma interface
// { name, formats, synthesize(params) } e registre abaixo em index.js.
