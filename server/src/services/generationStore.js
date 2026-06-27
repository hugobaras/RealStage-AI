import { randomUUID } from "crypto";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getFirebaseConfig } from "../config.js";
import { initFirebaseAdmin, isFirebaseConfigured } from "./firebaseAdmin.js";
import {
  incrementPropertyGenerationCount,
  updatePropertyRoomProgress,
} from "./propertyStore.js";

const SIGNED_URL_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function isStorageEnabled() {
  return getFirebaseConfig().storageConfigured;
}

function bucket() {
  const { storageBucket } = getFirebaseConfig();
  return getStorage().bucket(storageBucket);
}

async function uploadImage(storagePath, buffer) {
  const file = bucket().file(storagePath);
  await file.save(buffer, {
    contentType: "image/jpeg",
    resumable: false,
    metadata: { cacheControl: "private, max-age=3600" },
  });
}

async function signedReadUrl(storagePath) {
  const [url] = await bucket()
    .file(storagePath)
    .getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + SIGNED_URL_TTL_MS,
    });
  return url;
}

async function fetchImageBuffer(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Impossible de récupérer l'image générée.");
  }
  return Buffer.from(await response.arrayBuffer());
}

async function resolveImageUrl(data) {
  if (data.resultImagePath) {
    return signedReadUrl(data.resultImagePath);
  }
  return data.resultImageUrl ?? null;
}

async function resolveBaseImageUrl(data) {
  if (data.baseImagePath) {
    return signedReadUrl(data.baseImagePath);
  }
  return data.baseImageUrl ?? null;
}

async function toGenerationEntry(id, data) {
  return {
    id,
    imageUrl: await resolveImageUrl(data),
    baseImageUrl: await resolveBaseImageUrl(data),
    mode: data.mode,
    roomType: data.roomType,
    style: data.style ?? null,
    favorite: data.favorite ?? false,
    variantGroupId: data.variantGroupId ?? null,
    variantIndex: data.variantIndex ?? null,
    propertyId: data.propertyId ?? null,
    timestamp: data.createdAt?.toMillis?.() ?? Date.now(),
  };
}

export async function saveGeneration(uid, payload) {
  if (!isFirebaseConfigured()) return null;
  initFirebaseAdmin();

  const id = randomUUID();
  const db = getFirestore();
  let record;

  if (isStorageEnabled()) {
    const basePath = `users/${uid}/generations/${id}/base.jpg`;
    const resultPath = `users/${uid}/generations/${id}/result.jpg`;

    await uploadImage(basePath, payload.baseBuffer);
    const resultBuffer = await fetchImageBuffer(payload.resultUrl);
    await uploadImage(resultPath, resultBuffer);

    record = {
      mode: payload.mode,
      roomType: payload.roomType,
      style: payload.style ?? null,
      prompt: payload.prompt ?? null,
      favorite: false,
      variantGroupId: payload.variantGroupId ?? null,
      variantIndex: payload.variantIndex ?? null,
      propertyId: payload.propertyId ?? null,
      baseImagePath: basePath,
      resultImagePath: resultPath,
      createdAt: FieldValue.serverTimestamp(),
    };
  } else {
    record = {
      mode: payload.mode,
      roomType: payload.roomType,
      style: payload.style ?? null,
      prompt: payload.prompt ?? null,
      favorite: false,
      variantGroupId: payload.variantGroupId ?? null,
      variantIndex: payload.variantIndex ?? null,
      propertyId: payload.propertyId ?? null,
      resultImageUrl: payload.resultUrl,
      createdAt: FieldValue.serverTimestamp(),
    };
  }

  await db
    .collection("users")
    .doc(uid)
    .collection("generations")
    .doc(id)
    .set(record);

  if (payload.propertyId) {
    await incrementPropertyGenerationCount(uid, payload.propertyId);
    await updatePropertyRoomProgress(
      uid,
      payload.propertyId,
      payload.roomType,
      "done",
    );
  }

  return toGenerationEntry(id, {
    ...record,
    createdAt: { toMillis: () => Date.now() },
  });
}

export async function listGenerations(uid, limit = 50, propertyId = null) {
  if (!isFirebaseConfigured()) return [];
  initFirebaseAdmin();

  const fetchLimit = propertyId ? Math.max(limit, 200) : limit;

  const snapshot = await getFirestore()
    .collection("users")
    .doc(uid)
    .collection("generations")
    .orderBy("createdAt", "desc")
    .limit(fetchLimit)
    .get();

  let entries = await Promise.all(
    snapshot.docs.map((doc) => toGenerationEntry(doc.id, doc.data())),
  );

  if (propertyId) {
    entries = entries
      .filter((entry) => entry.propertyId === propertyId)
      .slice(0, limit);
  }

  return entries;
}

export async function getGeneration(uid, id) {
  if (!isFirebaseConfigured()) return null;
  initFirebaseAdmin();

  const ref = getFirestore()
    .collection("users")
    .doc(uid)
    .collection("generations")
    .doc(id);

  const doc = await ref.get();
  if (!doc.exists) {
    const err = new Error("Génération introuvable.");
    err.status = 404;
    throw err;
  }

  return toGenerationEntry(id, doc.data());
}

export async function updateGenerationFavorite(uid, id, favorite) {
  if (!isFirebaseConfigured()) return null;
  initFirebaseAdmin();

  const ref = getFirestore()
    .collection("users")
    .doc(uid)
    .collection("generations")
    .doc(id);

  const doc = await ref.get();
  if (!doc.exists) {
    const err = new Error("Génération introuvable.");
    err.status = 404;
    throw err;
  }

  await ref.update({ favorite: Boolean(favorite) });

  return toGenerationEntry(id, {
    ...doc.data(),
    favorite: Boolean(favorite),
    createdAt: doc.data().createdAt,
  });
}

export async function getUserCredits(uid) {
  if (!isFirebaseConfigured()) return 0;
  initFirebaseAdmin();

  const doc = await getFirestore().collection("users").doc(uid).get();
  return doc.data()?.creditsUsed ?? 0;
}

export async function deleteGeneration(uid, id) {
  if (!isFirebaseConfigured()) {
    throw Object.assign(new Error("Firebase non configuré."), { status: 503 });
  }
  initFirebaseAdmin();

  const ref = getFirestore()
    .collection("users")
    .doc(uid)
    .collection("generations")
    .doc(id);

  const doc = await ref.get();
  if (!doc.exists) {
    const err = new Error("Génération introuvable.");
    err.status = 404;
    throw err;
  }

  const data = doc.data();

  if (isStorageEnabled()) {
    const bucketRef = bucket();
    const paths = [data.baseImagePath, data.resultImagePath].filter(Boolean);
    await Promise.all(
      paths.map((p) =>
        bucketRef
          .file(p)
          .delete()
          .catch(() => {}),
      ),
    );
  }

  await ref.delete();
  return { id, deleted: true };
}

export async function listGenerationsAdmin({
  uid = null,
  mode = null,
  limit = 50,
} = {}) {
  if (!isFirebaseConfigured()) return [];
  initFirebaseAdmin();

  const db = getFirestore();
  const results = [];

  if (uid) {
    const snapshot = await db
      .collection("users")
      .doc(uid)
      .collection("generations")
      .orderBy("createdAt", "desc")
      .limit(Math.min(limit, 100))
      .get();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (mode && data.mode !== mode) continue;
      results.push({
        id: doc.id,
        uid,
        mode: data.mode,
        roomType: data.roomType,
        style: data.style ?? null,
        favorite: data.favorite ?? false,
        propertyId: data.propertyId ?? null,
        createdAt: data.createdAt?.toMillis?.() ?? null,
        imageUrl: await resolveImageUrl(data).catch(() => null),
      });
    }
    return results;
  }

  try {
    const snapshot = await db
      .collectionGroup("generations")
      .orderBy("createdAt", "desc")
      .limit(Math.min(limit, 100))
      .get();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (mode && data.mode !== mode) continue;
      const userUid = doc.ref.parent.parent?.id;
      results.push({
        id: doc.id,
        uid: userUid,
        mode: data.mode,
        roomType: data.roomType,
        style: data.style ?? null,
        favorite: data.favorite ?? false,
        propertyId: data.propertyId ?? null,
        createdAt: data.createdAt?.toMillis?.() ?? null,
        imageUrl: await resolveImageUrl(data).catch(() => null),
      });
    }
  } catch {
    const usersSnap = await db.collection("users").limit(20).get();
    for (const userDoc of usersSnap.docs) {
      const snapshot = await userDoc.ref
        .collection("generations")
        .orderBy("createdAt", "desc")
        .limit(10)
        .get();
      for (const doc of snapshot.docs) {
        const data = doc.data();
        if (mode && data.mode !== mode) continue;
        results.push({
          id: doc.id,
          uid: userDoc.id,
          mode: data.mode,
          roomType: data.roomType,
          style: data.style ?? null,
          favorite: data.favorite ?? false,
          propertyId: data.propertyId ?? null,
          createdAt: data.createdAt?.toMillis?.() ?? null,
          imageUrl: await resolveImageUrl(data).catch(() => null),
        });
      }
    }
    results.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    return results.slice(0, limit);
  }

  return results;
}

export function isGenerationStorageEnabled() {
  return isStorageEnabled();
}
