# RealStage AI

SaaS de virtual staging IA pour agents immobiliers. Uploadez une photo de pièce vide, composez la disposition avec des placeholders drag-and-drop, choisissez un style, et générez un rendu photoréaliste.

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

## Structure

- `client/` — React + Fabric.js (éditeur canvas)
- `server/` — Express + Fal.ai inpainting
