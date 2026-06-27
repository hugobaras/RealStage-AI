import { randomUUID } from "crypto";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { initFirebaseAdmin, isFirebaseConfigured } from "./firebaseAdmin.js";

function agenciesRef() {
  initFirebaseAdmin();
  return getFirestore().collection("agencies");
}

export async function createAgency({
  name,
  ownerUid,
  seatLimit = 5,
  propertyLimit = 50,
}) {
  if (!isFirebaseConfigured()) {
    throw Object.assign(new Error("Firebase non configuré."), { status: 503 });
  }

  const id = randomUUID();
  const now = FieldValue.serverTimestamp();
  const record = {
    name: name?.trim() || "Agence",
    ownerUid,
    seatLimit,
    propertyLimit,
    createdAt: now,
    updatedAt: now,
  };

  await agenciesRef().doc(id).set(record);
  await agenciesRef().doc(id).collection("members").doc(ownerUid).set({
    role: "owner",
    email: null,
    joinedAt: now,
  });

  await getFirestore()
    .collection("users")
    .doc(ownerUid)
    .set({ agencyId: id, agencyRole: "owner" }, { merge: true });

  return { id, ...record };
}

export async function listAgenciesAdmin() {
  if (!isFirebaseConfigured()) return [];

  initFirebaseAdmin();
  const snapshot = await agenciesRef()
    .orderBy("createdAt", "desc")
    .limit(100)
    .get();
  const auth = getAuth();

  return Promise.all(
    snapshot.docs.map(async (doc) => {
      const data = doc.data();
      const membersSnap = await doc.ref.collection("members").count().get();
      let ownerEmail = null;
      try {
        const owner = await auth.getUser(data.ownerUid);
        ownerEmail = owner.email;
      } catch {
        // ignore
      }

      const userDoc = await getFirestore()
        .collection("users")
        .doc(data.ownerUid)
        .get();
      const propertyCount = userDoc.exists
        ? (
            await getFirestore()
              .collection("users")
              .doc(data.ownerUid)
              .collection("properties")
              .count()
              .get()
          ).data().count
        : 0;

      return {
        id: doc.id,
        name: data.name,
        ownerUid: data.ownerUid,
        ownerEmail,
        seatLimit: data.seatLimit ?? 5,
        propertyLimit: data.propertyLimit ?? 50,
        memberCount: membersSnap.data().count,
        propertyCount,
        createdAt: data.createdAt?.toMillis?.() ?? null,
      };
    }),
  );
}

export async function getAgencyDetail(agencyId) {
  if (!isFirebaseConfigured()) {
    throw Object.assign(new Error("Firebase non configuré."), { status: 503 });
  }

  initFirebaseAdmin();
  const doc = await agenciesRef().doc(agencyId).get();
  if (!doc.exists) {
    throw Object.assign(new Error("Agence introuvable."), { status: 404 });
  }

  const data = doc.data();
  const membersSnap = await doc.ref.collection("members").get();
  const auth = getAuth();

  const members = await Promise.all(
    membersSnap.docs.map(async (m) => {
      const mData = m.data();
      let email = mData.email;
      if (!email) {
        try {
          const u = await auth.getUser(m.id);
          email = u.email;
        } catch {
          email = null;
        }
      }
      return {
        uid: m.id,
        role: mData.role,
        email,
        joinedAt: mData.joinedAt?.toMillis?.() ?? null,
      };
    }),
  );

  const ownerDoc = await getFirestore()
    .collection("users")
    .doc(data.ownerUid)
    .get();

  return {
    id: doc.id,
    ...data,
    members,
    agencySettings: ownerDoc.exists
      ? (ownerDoc.data().agencySettings ?? null)
      : null,
    createdAt: data.createdAt?.toMillis?.() ?? null,
  };
}

export async function inviteAgencyMember(agencyId, email, inviterUid) {
  if (!isFirebaseConfigured()) {
    throw Object.assign(new Error("Firebase non configuré."), { status: 503 });
  }

  initFirebaseAdmin();
  const agencyDoc = await agenciesRef().doc(agencyId).get();
  if (!agencyDoc.exists) {
    throw Object.assign(new Error("Agence introuvable."), { status: 404 });
  }

  const agency = agencyDoc.data();
  const membersCount = (
    await agencyDoc.ref.collection("members").count().get()
  ).data().count;

  if (membersCount >= (agency.seatLimit ?? 5)) {
    throw Object.assign(new Error("Limite de sièges atteinte."), {
      status: 400,
    });
  }

  const token = randomUUID();
  await getFirestore()
    .collection("invites")
    .doc(token)
    .set({
      agencyId,
      email: email.trim().toLowerCase(),
      inviterUid,
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

  return { token, email };
}

export async function acceptAgencyInvite(token, uid, userEmail) {
  if (!isFirebaseConfigured()) {
    throw Object.assign(new Error("Firebase non configuré."), { status: 503 });
  }

  initFirebaseAdmin();
  const inviteRef = getFirestore().collection("invites").doc(token);
  const inviteDoc = await inviteRef.get();
  if (!inviteDoc.exists) {
    throw Object.assign(new Error("Invitation invalide."), { status: 404 });
  }

  const invite = inviteDoc.data();
  if (invite.email !== userEmail?.trim().toLowerCase()) {
    throw Object.assign(
      new Error("Cette invitation ne correspond pas à votre e-mail."),
      {
        status: 403,
      },
    );
  }

  const agencyId = invite.agencyId;
  await agenciesRef().doc(agencyId).collection("members").doc(uid).set({
    role: "member",
    email: userEmail,
    joinedAt: FieldValue.serverTimestamp(),
  });

  await getFirestore()
    .collection("users")
    .doc(uid)
    .set({ agencyId, agencyRole: "member" }, { merge: true });

  await inviteRef.delete();
  return { agencyId };
}
