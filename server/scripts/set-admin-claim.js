/**
 * Attribue ou retire le custom claim admin sur un compte Firebase.
 *
 * Usage:
 *   node scripts/set-admin-claim.js user@example.com
 *   node scripts/set-admin-claim.js user@example.com --revoke
 *
 * L'utilisateur doit se reconnecter pour que le nouveau claim soit pris en compte.
 */
import { getAuth } from "firebase-admin/auth";
import { initFirebaseAdmin } from "../src/services/firebaseAdmin.js";

const email = process.argv[2];
const revoke = process.argv.includes("--revoke");

if (!email) {
  console.error("Usage: node scripts/set-admin-claim.js <email> [--revoke]");
  process.exit(1);
}

if (!initFirebaseAdmin()) {
  console.error("Firebase Admin non configuré. Vérifiez server/.env");
  process.exit(1);
}

const auth = getAuth();

try {
  const user = await auth.getUserByEmail(email);
  await auth.setCustomUserClaims(user.uid, { admin: !revoke });
  console.log(
    revoke
      ? `Claim admin retiré pour ${email} (${user.uid})`
      : `Claim admin accordé à ${email} (${user.uid})`,
  );
  console.log("L'utilisateur doit se déconnecter puis se reconnecter.");
} catch (err) {
  console.error(err.message ?? err);
  process.exit(1);
}
