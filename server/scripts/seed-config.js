/**
 * Initialise la collection Firestore config/ depuis les constantes du code.
 *
 * Usage: node scripts/seed-config.js
 */
import { initFirebaseAdmin } from "../src/services/firebaseAdmin.js";
import { seedAllConfig } from "../src/services/seedConfig.js";

if (!initFirebaseAdmin()) {
  console.error("Firebase Admin non configuré. Vérifiez server/.env");
  process.exit(1);
}

await seedAllConfig("seed-script");
console.log("Seed terminé — cache config rafraîchi.");
