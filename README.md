# RealStage

SaaS de virtual staging pour agents immobiliers. Uploadez une photo de pièce vide, composez la disposition avec des placeholders drag-and-drop, choisissez un style, et générez un rendu photoréaliste.

## Prérequis

- Node.js 18+
- Clé API [Fal.ai](https://fal.ai/dashboard)

## Installation

```bash
npm install
cp server/.env.example server/.env
# Éditez server/.env et ajoutez votre FAL_KEY
```

## Développement

```bash
npm run dev
```

- Frontend : http://localhost:5173
- Backend : http://localhost:3001

## Chat support (RAG + Discord)

Utilisateurs connectés : bulle de chat avec assistant Mistral (RAG sur FAQ, forfaits, modes, catalogue).

```bash
# server/.env
MISTRAL_API_KEY=...
DISCORD_BOT_TOKEN=...          # optionnel — pont agent humain
DISCORD_SUPPORT_CHANNEL_ID=...

npm run build:rag -w @realstage-ai/server
```

Les agents répondent dans un fil Discord ; les messages sont relayés en temps réel dans le widget (Socket.io).

## Structure

- `client/` — React + Fabric.js (éditeur canvas)
- `server/` — Express + Fal.ai inpainting
