# TTS Studio (MVP)
React + TypeScript (Vite) no frontend; Node/Express no backend. Provedor TTS: **Azure AI Speech** (REST + SSML).
A chave fica só no backend (`TTS_API_KEY`); o navegador chama apenas `/api/*`.

## Pré-requisitos
Node 18+. No portal Azure, crie um recurso **Speech** (o plano F0 é gratuito). Copie a **chave** e a **região**.

## Rodar localmente
    cd backend && cp .env.example .env      # preencha TTS_API_KEY e ajuste a região em TTS_API_URL
    npm install && npm run dev              # http://localhost:3001
    # em outro terminal:
    cd frontend && npm install && npm run dev   # http://localhost:5173 (proxy para /api)

## Publicar (um único serviço: Render, Railway, Fly.io…)
- Build: `npm --prefix frontend ci && npm --prefix frontend run build && npm --prefix backend ci`
- Start: `node backend/src/server.js` (serve o frontend compilado e a API na mesma porta)
- Variáveis de ambiente do serviço: `TTS_PROVIDER`, `TTS_API_KEY`, `TTS_API_URL`, `ALLOWED_ORIGIN` (URL pública) e `MAX_CHARS`.

## Trocar de provedor
Crie `backend/src/providers/<nome>.js` com `{ name, formats, synthesize(params) }`, registre em `providers/index.js` e defina `TTS_PROVIDER=<nome>`.

## Limitações conhecidas
- Estabilidade, expressividade, emoção, clareza e intensidade **não existem** no REST do Azure para estas vozes, então não foram simuladas. Estão disponíveis: velocidade, pitch, volume e pausas (+ SSML `break`/`emphasis`). Esses controles entram num provedor que os exponha, como o ElevenLabs.
- Histórico e favoritos ficam no `localStorage` do navegador (sem áudio salvo; "Duplicar" recarrega texto e configurações).
- Rótulos de estilo das vozes (jornalística, documental etc.) são editoriais: confira ouvindo. A lista oficial fica em `GET {região}.tts.speech.microsoft.com/cognitiveservices/voices/list`.
