import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { initFirebaseAdmin, isFirebaseConfigured } from "./firebaseAdmin.js";
import { ensureConfigCache, getConfigCacheSync } from "./configStore.js";

const DEFAULT_BLACKLIST = { emails: [], domains: [] };

export async function getBlacklist() {
  if (!isFirebaseConfigured()) return DEFAULT_BLACKLIST;

  await ensureConfigCache();
  const config = getConfigCacheSync();
  return {
    emails: config.blacklist?.emails ?? [],
    domains: config.blacklist?.domains ?? [],
    updatedAt: config.blacklist?.updatedAt ?? null,
  };
}

export async function updateBlacklist({ emails, domains }, adminUid) {
  if (!isFirebaseConfigured()) {
    throw Object.assign(new Error("Firebase non configuré."), { status: 503 });
  }

  initFirebaseAdmin();
  const normalized = {
    emails: (emails ?? [])
      .map((e) => String(e).trim().toLowerCase())
      .filter(Boolean),
    domains: (domains ?? [])
      .map((d) => String(d).trim().toLowerCase())
      .filter(Boolean),
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: adminUid,
  };

  await getFirestore().collection("config").doc("blacklist").set(normalized);
  const { refreshConfigCache } = await import("./configStore.js");
  await refreshConfigCache();
  return getBlacklist();
}

export function isEmailBlacklisted(email) {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const config = getConfigCacheSync();
  const blacklist = config.blacklist ?? DEFAULT_BLACKLIST;
  const emails = blacklist.emails ?? [];
  const domains = blacklist.domains ?? [];

  if (emails.includes(normalized)) return true;

  const at = normalized.lastIndexOf("@");
  if (at === -1) return false;
  const domain = normalized.slice(at + 1);
  return domains.some((d) => domain === d || domain.endsWith(`.${d}`));
}

export async function assertEmailAllowed(email) {
  await ensureConfigCache();
  if (isEmailBlacklisted(email)) {
    throw Object.assign(
      new Error("Cette adresse e-mail n'est pas autorisée."),
      { status: 403, code: "EMAIL_BLACKLISTED" },
    );
  }
}
