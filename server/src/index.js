import {
  getFalConfig,
  getFirebaseConfig,
  getStripeConfig,
  ENV_PATH,
} from "./config.js";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import generateRouter from "./routes/generate.js";
import generationsRouter from "./routes/generations.js";
import authRouter from "./routes/auth.js";
import subscriptionRouter from "./routes/subscription.js";
import billingWebhookRouter from "./routes/billing.js";
import propertiesRouter from "./routes/properties.js";
import agencySettingsRouter from "./routes/agencySettings.js";
import reportsRouter from "./routes/reports.js";
import adminRouter from "./routes/admin/index.js";
import configRouter from "./routes/config.js";
import { initFirebaseAdmin } from "./services/firebaseAdmin.js";
import { refreshConfigCache } from "./services/configStore.js";
import { isStripeConfigured } from "./services/stripeService.js";
import agenciesRouter from "./routes/agencies.js";
import { getConfigCacheSync } from "./services/configStore.js";
import { createServer } from "http";
import { Server } from "socket.io";
import chatRouter from "./routes/chat.js";
import { initChatSocket } from "./services/chatSocket.js";
import { setChatIo } from "./services/chatRealtime.js";
import {
  initDiscordBridge,
  shutdownDiscordBridge,
  isDiscordBridgeConfigured,
} from "./services/discordBridgeService.js";
import { getRagIndex } from "./services/ragService.js";

const app = express();
const PORT = process.env.PORT || 3001;
const falConfig = getFalConfig();
const firebaseConfig = getFirebaseConfig();
const stripeConfig = getStripeConfig();

if (firebaseConfig.configured) {
  initFirebaseAdmin();
  refreshConfigCache().catch((err) => {
    console.warn("Config cache init:", err.message);
  });
}

const corsOrigins = [
  stripeConfig.clientUrl,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(cors({ origin: [...new Set(corsOrigins)] }));

app.use("/api", billingWebhookRouter);

app.use(express.json({ limit: "15mb" }));

app.get("/api/health", (_req, res) => {
  const platform = getConfigCacheSync().platform ?? {};
  res.json({
    status: platform.maintenance?.enabled ? "maintenance" : "ok",
    product: "RealStage AI",
    version: process.env.DEPLOY_VERSION ?? "0.1.0",
    uptimeSeconds: Math.floor(process.uptime()),
    fal: {
      configured: falConfig.keyLoaded,
      model: platform.falModels?.staging ?? falConfig.model,
      declutterModel: platform.falModels?.declutter ?? falConfig.declutterModel,
      replaceModel: platform.falModels?.replace ?? falConfig.replaceModel,
    },
    firebase: {
      configured: firebaseConfig.configured,
      storage: firebaseConfig.storageConfigured,
    },
    stripe: {
      configured: stripeConfig.configured,
    },
    maintenance: platform.maintenance ?? { enabled: false },
  });
});

app.use("/api", authRouter);
app.use("/api", subscriptionRouter);
app.use("/api", propertiesRouter);
app.use("/api", agencySettingsRouter);
app.use("/api", agenciesRouter);
app.use("/api", reportsRouter);
app.use("/api/config", configRouter);
app.use("/api/admin", adminRouter);
app.use("/api", generationsRouter);
app.use("/api", generateRouter);
app.use("/api", chatRouter);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");

if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir, { index: false }));
  app.get("*", (req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      return next();
    }
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(publicDir, "index.html"), (err) => {
      if (err) next(err);
    });
  });
  console.log(`Frontend statique servi depuis ${publicDir}`);
}

app.use((err, _req, res, _next) => {
  console.error(err);

  if (err.status && err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ error: err.message });
  }

  if (
    err.name === "SubscriptionError" ||
    err.name === "PlanError" ||
    err.code?.includes?.("trial") ||
    err.code?.includes?.("_required") ||
    err.status === 402 ||
    err.status === 403
  ) {
    return res.status(err.status ?? 402).json({
      error: err.message,
      code: err.code,
    });
  }

  const formatted = formatFalError(err);
  res.status(formatted.status).json({
    error: formatted.message,
    code: formatted.code,
  });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: [...new Set(corsOrigins)], credentials: true },
});
setChatIo(io);
initChatSocket(io);

if (isDiscordBridgeConfigured()) {
  console.log("Discord configuré — connexion du bot en cours…");
  initDiscordBridge().catch((err) => {
    console.error("Discord bridge:", err.message);
  });
} else {
  console.warn(
    "Discord non configuré — ajoutez DISCORD_BOT_TOKEN et DISCORD_SUPPORT_CHANNEL_ID dans server/.env",
  );
}

const ragIndex = getRagIndex();
if (ragIndex.chunks?.length) {
  console.log(`Index RAG chargé (${ragIndex.chunks.length} chunks)`);
} else {
  console.warn(
    "Index RAG absent — lancez npm run build:rag -w @realstage-ai/server (recherche par mots-clés en secours).",
  );
}

const server = httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`RealStage AI server running on http://localhost:${PORT}`);
  if (!falConfig.keyLoaded) {
    console.warn(`FAL_KEY manquante — ajoutez-la dans ${ENV_PATH}`);
  } else {
    console.log(`Fal.ai prêt (modèle: ${falConfig.model})`);
  }
  if (!firebaseConfig.configured) {
    console.warn(
      `Firebase Admin non configuré — les routes API sont ouvertes sans auth`,
    );
  } else {
    console.log(`Firebase Auth actif (projet: ${firebaseConfig.projectId})`);
    if (firebaseConfig.storageConfigured) {
      console.log(`Firebase Storage actif (${firebaseConfig.storageBucket})`);
    } else {
      console.log(
        "Firebase Storage désactivé — historique en Firestore (URLs Fal)",
      );
    }
  }
  if (isStripeConfigured()) {
    console.log("Stripe actif — paiements et webhooks activés");
  } else {
    console.warn("Stripe non configuré — mode démo abonnement");
  }
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} déjà utilisé. Arrêtez l'autre processus ou changez PORT dans server/.env`,
    );
  } else {
    console.error("Erreur serveur:", err);
  }
  process.exit(1);
});

function shutdown() {
  shutdownDiscordBridge()
    .catch(() => {})
    .finally(() => {
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(0), 2000).unref();
    });
}

process.on("SIGINT", shutdown);
