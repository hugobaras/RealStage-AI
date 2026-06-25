import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";
import path from "path";
import { ENV_PATH, getFirebaseConfig } from "../config.js";

let initialized = false;

export function isFirebaseConfigured() {
  return getFirebaseConfig().configured;
}

function resolveServiceAccountPath(serviceAccountPath) {
  if (path.isAbsolute(serviceAccountPath)) {
    return serviceAccountPath;
  }
  return path.resolve(path.dirname(ENV_PATH), serviceAccountPath);
}

export function initFirebaseAdmin() {
  if (initialized) return true;

  const config = getFirebaseConfig();
  if (!config.configured) return null;

  if (getApps().length > 0) {
    initialized = true;
    return true;
  }

  const appOptions = { projectId: config.projectId };
  if (config.storageConfigured) {
    appOptions.storageBucket = config.storageBucket;
  }

  if (config.serviceAccountPath) {
    const resolved = resolveServiceAccountPath(config.serviceAccountPath);
    const serviceAccount = JSON.parse(fs.readFileSync(resolved, "utf8"));
    initializeApp({
      ...appOptions,
      credential: cert(serviceAccount),
      projectId: config.projectId ?? serviceAccount.project_id,
    });
  } else {
    initializeApp({
      ...appOptions,
      credential: cert({
        projectId: config.projectId,
        clientEmail: config.clientEmail,
        privateKey: config.privateKey,
      }),
    });
  }

  initialized = true;
  return true;
}

export async function verifyIdToken(idToken) {
  if (!initFirebaseAdmin()) {
    throw new Error("Firebase Admin non configuré.");
  }
  return getAuth().verifyIdToken(idToken);
}
