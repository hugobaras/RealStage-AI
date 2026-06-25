import { randomUUID } from "crypto";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { initFirebaseAdmin, isFirebaseConfigured } from "./firebaseAdmin.js";

export function slugifyAddress(address) {
  if (!address?.trim()) return "bien";
  return address
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function toPropertyEntry(id, data) {
  return {
    id,
    label: data.label ?? "",
    address: data.address ?? "",
    slug: data.slug ?? slugifyAddress(data.address),
    roomProgress: data.roomProgress ?? {},
    generationCount: data.generationCount ?? 0,
    createdAt: data.createdAt?.toMillis?.() ?? null,
    updatedAt: data.updatedAt?.toMillis?.() ?? null,
  };
}

function propertiesRef(uid) {
  initFirebaseAdmin();
  return getFirestore().collection("users").doc(uid).collection("properties");
}

export async function listProperties(uid) {
  if (!isFirebaseConfigured()) return [];

  const snapshot = await propertiesRef(uid).orderBy("updatedAt", "desc").get();

  return snapshot.docs.map((doc) => toPropertyEntry(doc.id, doc.data()));
}

export async function getProperty(uid, propertyId) {
  if (!isFirebaseConfigured()) return null;

  const doc = await propertiesRef(uid).doc(propertyId).get();
  if (!doc.exists) return null;
  return toPropertyEntry(doc.id, doc.data());
}

export async function createProperty(uid, { label, address }) {
  if (!isFirebaseConfigured()) return null;

  const id = randomUUID();
  const slug = slugifyAddress(address);
  const now = FieldValue.serverTimestamp();

  const record = {
    label: label?.trim() || address?.trim() || "Nouveau bien",
    address: address?.trim() || "",
    slug,
    roomProgress: {},
    generationCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  await propertiesRef(uid).doc(id).set(record);

  return toPropertyEntry(id, {
    ...record,
    createdAt: { toMillis: () => Date.now() },
    updatedAt: { toMillis: () => Date.now() },
  });
}

export async function updateProperty(uid, propertyId, updates) {
  if (!isFirebaseConfigured()) return null;

  const ref = propertiesRef(uid).doc(propertyId);
  const doc = await ref.get();
  if (!doc.exists) {
    const err = new Error("Bien introuvable.");
    err.status = 404;
    throw err;
  }

  const patch = { updatedAt: FieldValue.serverTimestamp() };

  if (updates.label != null) patch.label = String(updates.label).trim();
  if (updates.address != null) {
    patch.address = String(updates.address).trim();
    patch.slug = slugifyAddress(patch.address);
  }
  if (updates.roomProgress != null) {
    patch.roomProgress = updates.roomProgress;
  }

  await ref.update(patch);

  const updated = await ref.get();
  return toPropertyEntry(updated.id, updated.data());
}

export async function deleteProperty(uid, propertyId) {
  if (!isFirebaseConfigured()) return false;

  const ref = propertiesRef(uid).doc(propertyId);
  const doc = await ref.get();
  if (!doc.exists) {
    const err = new Error("Bien introuvable.");
    err.status = 404;
    throw err;
  }

  const db = getFirestore();
  const generationsRef = db
    .collection("users")
    .doc(uid)
    .collection("generations");

  const linked = await generationsRef
    .where("propertyId", "==", propertyId)
    .get();

  const batch = db.batch();
  linked.docs.forEach((genDoc) => {
    batch.update(genDoc.ref, { propertyId: null });
  });
  batch.delete(ref);
  await batch.commit();

  return true;
}

export async function assertPropertyOwned(uid, propertyId) {
  const property = await getProperty(uid, propertyId);
  if (!property) {
    const err = new Error("Bien introuvable.");
    err.status = 404;
    throw err;
  }
  return property;
}

export async function incrementPropertyGenerationCount(uid, propertyId) {
  if (!isFirebaseConfigured() || !propertyId) return;

  const ref = propertiesRef(uid).doc(propertyId);
  await ref.update({
    generationCount: FieldValue.increment(1),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function updatePropertyRoomProgress(
  uid,
  propertyId,
  roomType,
  status,
) {
  if (!isFirebaseConfigured() || !propertyId || !roomType) return;

  const ref = propertiesRef(uid).doc(propertyId);
  const doc = await ref.get();
  if (!doc.exists) return;

  const roomProgress = {
    ...(doc.data().roomProgress ?? {}),
    [roomType]: status,
  };
  await ref.update({
    roomProgress,
    updatedAt: FieldValue.serverTimestamp(),
  });
}
