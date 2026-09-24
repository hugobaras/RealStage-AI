# RealStage

Application web de virtual staging pour l’immobilier.
Chargez une photo de pièce vide, composez la scène dans l’éditeur, puis générez un rendu meublé.

## Fonctionnalités

- Éditeur visuel drag-and-drop (canvas)
- Génération d’images meublées
- Mode désencombrement d’image
- Gestion d’abonnements (Stripe)
- Chat support connecté à Discord (optionnel)

## Stack

- Frontend : React + Vite
- Backend : Node.js + Express
- Temps réel : Socket.io
- Paiement : Stripe
- Stockage / auth : Firebase

## Prérequis

- Node.js 18+
- npm 9+
- Clé API Fal

## Installation

```bash
npm install
cp server/.env.example server/.env
```

Renseignez ensuite les variables nécessaires dans `server/.env`, au minimum :

- `FAL_KEY`
- `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` (si paiements activés)
- Variables Firebase (si authentification / stockage activés)

## Lancer en local

```bash
npm run dev
```

- Frontend : http://localhost:5173
- Backend : http://localhost:3001

## Commandes utiles

```bash
# serveur seul
npm run dev:server

# client seul
npm run dev:client

# reconstruire l’index de connaissances du chat
npm run build:rag -w @realstage-ai/server
```

## Structure du projet

- `client/` : application frontend
- `server/` : API et logique métier
- `firebase/` : configuration Firebase
