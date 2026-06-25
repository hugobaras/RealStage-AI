import {
  getFalConfig,
  getFirebaseConfig,
  getStripeConfig,
  ENV_PATH,
} from "./config.js";
import express from "express";
import cors from "cors";
import generateRouter from "./routes/generate.js";
import generationsRouter from "./routes/generations.js";
import authRouter from "./routes/auth.js";
import subscriptionRouter from "./routes/subscription.js";
import billingWebhookRouter from "./routes/billing.js";
import propertiesRouter from "./routes/properties.js";
import agencySettingsRouter from "./routes/agencySettings.js";
import { initFirebaseAdmin } from "./services/firebaseAdmin.js";
import { isStripeConfigured } from "./services/stripeService.js";
import { formatFalError } from "./utils/falErrors.js";

const app = express();
const PORT = process.env.PORT || 3001;
const falConfig = getFalConfig();
const firebaseConfig = getFirebaseConfig();
const stripeConfig = getStripeConfig();

if (firebaseConfig.configured) {
  initFirebaseAdmin();
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
  res.json({
    status: "ok",
    product: "RealStage AI",
    fal: {
      configured: falConfig.keyLoaded,
      model: falConfig.model,
      declutterModel: falConfig.declutterModel,
    },
    firebase: {
      configured: firebaseConfig.configured,
      storage: firebaseConfig.storageConfigured,
    },
    stripe: {
      configured: stripeConfig.configured,
    },
  });
});

app.use("/api", authRouter);
app.use("/api", subscriptionRouter);
app.use("/api", propertiesRouter);
app.use("/api", agencySettingsRouter);
app.use("/api", generationsRouter);
app.use("/api", generateRouter);

app.use((err, _req, res, _next) => {
  console.error(err);

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

const server = app.listen(PORT, () => {
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
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 2000).unref();
}

process.on("SIGINT", shutdown);
