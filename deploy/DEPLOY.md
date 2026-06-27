# Déploiement Docker — RealStage AI

Conteneur unique : **API Express + frontend statique** sur le port **3011** (localhost uniquement).

## Prérequis VPS

- Docker + Docker Compose plugin
- Nginx déjà en place (ports 80/443)
- Ports **3011** libre (3000–3002 et 3010 déjà utilisés sur votre VPS)

## Installation rapide

```bash
cd /var/www/RealStage-AI

# 1. Variables d'environnement
cp .env.production.example .env.production
nano .env.production
# Renseigner VITE_* + secrets serveur + CLIENT_URL=https://votre-domaine

# 2. Clé Firebase (fichier JSON du compte de service)
mkdir -p secrets
cp /chemin/vers/votre-firebase-adminsdk.json secrets/firebase-service-account.json
chmod 600 secrets/firebase-service-account.json

# 3. Build et démarrage
docker compose build --no-cache
docker compose up -d

# 4. Vérifier
curl -s http://127.0.0.1:3011/api/health | jq
docker compose logs -f realstage
```

## Nginx (reverse proxy)

Voir `deploy/nginx.conf.example`. Adapter `server_name` et activer TLS avec Certbot.

`CLIENT_URL` dans `.env.production` doit correspondre à l’URL publique (ex. `https://realstage.votredomaine.com`).

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
docker compose build --no-cache && docker compose up -d   # après changement VITE_*
```

## Rebuild obligatoire si…

- Vous modifiez une variable `VITE_*` → `docker compose build --no-cache`
- Vous modifiez uniquement le `.env` serveur (FAL, Stripe…) → `docker compose up -d` suffit

## Port différent

Dans `.env.production` : `PORT=3020`  
Dans `docker-compose.yml` : `"127.0.0.1:3020:3020"`  
Et mettre à jour l’`upstream` Nginx.
