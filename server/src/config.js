import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ENV_PATH = path.resolve(__dirname, "../.env");

dotenv.config({ path: ENV_PATH });

export function getFalConfig() {
  const declutterModel =
    process.env.FAL_DECLUTTER_MODEL || "fal-ai/flux-2/edit";
  return {
    key: process.env.FAL_KEY,
    model:
      process.env.FAL_MODEL || "fal-ai/flux-2-lora-gallery/apartment-staging",
    declutterModel,
    replaceModel: process.env.FAL_REPLACE_MODEL || declutterModel,
    keyLoaded: Boolean(process.env.FAL_KEY),
  };
}

function normalizePrivateKey(key) {
  if (!key) return null;
  return key.replace(/\\n/g, "\n");
}

export function getFirebaseConfig() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  const configured = Boolean(
    projectId && (serviceAccountPath || (clientEmail && privateKey)),
  );

  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET?.trim() || null;

  return {
    projectId,
    serviceAccountPath,
    clientEmail,
    privateKey,
    storageBucket,
    storageConfigured: Boolean(storageBucket),
    configured,
  };
}

export function getStripeConfig() {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim() || null;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim() || null;
  const clientUrl = process.env.CLIENT_URL?.trim() || "http://localhost:5173";
  const prices = {
    starter: process.env.STRIPE_PRICE_STARTER?.trim() || null,
    pro: process.env.STRIPE_PRICE_PRO?.trim() || null,
    agence: process.env.STRIPE_PRICE_AGENCE?.trim() || null,
  };

  const configured = Boolean(
    secretKey && prices.starter && prices.pro && prices.agence,
  );

  return {
    secretKey,
    webhookSecret,
    clientUrl,
    prices,
    configured,
  };
}

export function getEmailConfig() {
  const host = process.env.SMTP_HOST?.trim() || null;
  const portRaw = process.env.SMTP_PORT?.trim();
  const port = portRaw ? Number(portRaw) : null;
  const secure = process.env.SMTP_SECURE?.trim() === "true";
  const user = process.env.SMTP_USER?.trim() || null;
  const pass = process.env.SMTP_PASS?.trim() || null;
  const from =
    process.env.SMTP_FROM?.trim() || "RealStage AI <noreply@realstage.ai>";
  const reportTo = process.env.REPORT_EMAIL_TO?.trim() || null;

  const configured = Boolean(
    host && port && !Number.isNaN(port) && user && pass && reportTo,
  );

  return {
    host,
    port,
    secure,
    user,
    pass,
    from,
    reportTo,
    configured,
  };
}
