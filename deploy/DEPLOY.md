# Déploiement Docker — RealStage

Conteneur unique : **API Express + frontend statique** sur le port **3011** (localhost uniquement).

## Prérequis VPS

- Docker + Docker Compose plugin
- Nginx déjà en place (ports 80/443)
- Ports **3011** libre (3000–3002 et 3010 déjà utilisés sur votre VPS)

## Installation rapide

```bash
cd /var/www/RealStage

# 1. Variables d'environnement
cp .env.production.example .env.production
nano .env.production
# Renseigner VITE_* + secrets serveur + CLIENT_URL=https://votre-domaine

# 2. Clé Firebase (fichier JSON du compte de service)
mkdir -p secrets
cp /chemin/vers/votre-firebase-adminsdk.json secrets/firebase-service-account.json
chmod 600 secrets/firebase-service-account.json

# 3. Build et démarrage (--env-file pour les variables VITE_* au build)
docker compose --env-file .env.production build --no-cache
docker compose --env-file .env.production up -d

# 4. Vérifier
curl -s http://127.0.0.1:3011/api/health | jq
docker compose logs -f realstage
```

## Nginx (reverse proxy)

Copier `deploy/nginx.conf.example` tel quel (bloc HTTP uniquement) :

```bash
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/realstage
sudo ln -sf /etc/nginx/sites-available/realstage /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d votre-domaine.tld -d www.votre-domaine.tld
```

Certbot ajoute HTTPS automatiquement. **Ne pas** ajouter de bloc `listen 443` à la main avant d’avoir les certificats.

`CLIENT_URL` dans `.env.production` doit correspondre à l’URL publique (ex. `https://votre-domaine.tld`).

## Stripe webhook

URL webhook : `https://votre-domaine/api/billing/webhook`

## Admin Firebase

```bash
docker compose exec realstage node scripts/set-admin-claim.js admin@votredomaine.com
```

L’utilisateur doit se reconnecter pour obtenir le claim `admin`.

## Commandes utiles

```bash
docker compose ps
docker compose logs -f realstage
docker compose restart realstage
docker compose down
docker compose --env-file .env.production build --no-cache && docker compose --env-file .env.production up -d   # après changement VITE_*
```

## Firebase Auth (connexion Google)

Après déploiement sur un nouveau domaine, configurer **Firebase Console** :

1. **Authentication → Paramètres → Domaines autorisés**  
   Ajouter : `votre-domaine.tld` (sans `https://`)

2. **Authentication → Méthode de connexion → Google**  
   Activer le fournisseur et enregistrer.

3. **Google Cloud Console** (votre projet) → **APIs et services → Identifiants**  
   Client OAuth « Web client (auto created by Google Service) » :
   - **Origines JavaScript autorisées** : `https://votre-domaine.tld`
   - **URI de redirection** : `https://votre-projet.firebaseapp.com/__/auth/handler`

4. Rebuild Docker si les `VITE_FIREBASE_*` ont changé :
   ```bash
   docker compose --env-file .env.production build --no-cache
   docker compose --env-file .env.production up -d
   ```

En cas d'erreur, ouvrir la console navigateur (F12) : le code Firebase (`auth/unauthorized-domain`, etc.) s'affiche dans les logs.

## Chat support (Mistral RAG + Discord)

Variables serveur dans `.env.production` :

```env
MISTRAL_API_KEY=...
DISCORD_BOT_TOKEN=...
DISCORD_SUPPORT_CHANNEL_ID=...
```

- **Mistral** : clé API sur [console.mistral.ai](https://console.mistral.ai). Sans clé, l’assistant propose uniquement l’escalade agent.
- **Index RAG** : construit au build Docker si `MISTRAL_API_KEY` est passée en `ARG` au build (`docker compose build`). Sinon, reconstruire manuellement :
  ```bash
  docker compose exec realstage npm run build:rag
  docker compose restart realstage
  ```
- **Discord** : créer un bot ([Discord Developer Portal](https://discord.com/developers/applications)), activer les intents `Message Content`, inviter le bot sur votre serveur avec droit « Gérer les fils », copier l’ID du canal support. Les agents répondent dans le fil créé ; `/close` clôt la session.

Nginx : le fichier `deploy/nginx.conf.example` inclut les en-têtes WebSocket requis pour Socket.io (chat temps réel).

- Vous modifiez une variable `VITE_*` → `docker compose build --no-cache`
- Vous modifiez uniquement le `.env` serveur (FAL, Stripe…) → `docker compose up -d` suffit

## Port différent

Dans `.env.production` : `PORT=3020`  
Dans `docker-compose.yml` : `"127.0.0.1:3020:3020"`  
Et mettre à jour l’`upstream` Nginx.
