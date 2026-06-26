import nodemailer from "nodemailer";
import { getEmailConfig } from "../config.js";
import { getReportReasonLabel } from "../constants/reportReasons.js";

const MODE_LABELS = {
  meubler: "Meubler",
  desencombrer: "Désencombrer",
  remplacer: "Remplacer",
};

const ROOM_LABELS = {
  salon: "Salon",
  chambre: "Chambre",
  cuisine: "Cuisine",
  sdb: "Salle de bain",
  bureau: "Bureau",
  entree: "Entrée",
  salle_manger: "Salle à manger",
  dressing: "Dressing",
  buanderie: "Buanderie",
  cave: "Cave / sous-sol",
  garage: "Garage",
  terrasse: "Terrasse / balcon",
  jardin: "Jardin",
  autre: "Autre",
};

const STYLE_LABELS = {
  moderne: "Moderne",
  scandinave: "Scandinave",
  industriel: "Industriel",
  classique: "Classique",
  boheme: "Bohème",
  minimaliste: "Minimaliste",
  rustique: "Rustique",
  art_deco: "Art déco",
  contemporain: "Contemporain",
  japandi: "Japandi",
  mid_century: "Mid-century",
  coastal: "Bord de mer",
  farmhouse: "Farmhouse",
  luxe: "Luxe",
  vintage: "Vintage",
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getTransporter() {
  const config = getEmailConfig();
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
}

export function isEmailConfigured() {
  return getEmailConfig().configured;
}

export async function sendGenerationReportEmail({
  user,
  generation,
  reason,
  comment,
}) {
  const config = getEmailConfig();
  if (!config.configured) {
    const err = new Error(
      "L'envoi de signalements par e-mail n'est pas configuré.",
    );
    err.status = 503;
    throw err;
  }

  const reasonLabel = getReportReasonLabel(reason);
  const modeLabel = MODE_LABELS[generation.mode] ?? generation.mode ?? "—";
  const roomLabel =
    ROOM_LABELS[generation.roomType] ?? generation.roomType ?? "—";
  const styleLabel = generation.style
    ? (STYLE_LABELS[generation.style] ?? generation.style)
    : "—";
  const timestamp = new Date().toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
  });

  const subject = `[RealStage AI] Signalement — ${reasonLabel} — ${generation.roomType ?? "pièce"}`;

  const html = `
    <h2>Signalement d'image générée</h2>
    <p><strong>Date :</strong> ${escapeHtml(timestamp)}</p>
    <hr />
    <h3>Utilisateur</h3>
    <ul>
      <li><strong>E-mail :</strong> ${escapeHtml(user.email ?? "—")}</li>
      <li><strong>UID :</strong> ${escapeHtml(user.uid)}</li>
    </ul>
    <h3>Génération</h3>
    <ul>
      <li><strong>ID :</strong> ${escapeHtml(generation.id)}</li>
      <li><strong>Mode :</strong> ${escapeHtml(modeLabel)}</li>
      <li><strong>Pièce :</strong> ${escapeHtml(roomLabel)}</li>
      <li><strong>Style :</strong> ${escapeHtml(styleLabel)}</li>
      ${
        generation.propertyId
          ? `<li><strong>Bien :</strong> ${escapeHtml(generation.propertyId)}</li>`
          : ""
      }
    </ul>
    <h3>Signalement</h3>
    <ul>
      <li><strong>Motif :</strong> ${escapeHtml(reasonLabel)}</li>
      ${
        comment
          ? `<li><strong>Commentaire :</strong> ${escapeHtml(comment)}</li>`
          : ""
      }
    </ul>
    <h3>Images</h3>
    <ul>
      <li><strong>Avant :</strong> <a href="${escapeHtml(generation.baseImageUrl ?? "")}">${escapeHtml(generation.baseImageUrl ?? "—")}</a></li>
      <li><strong>Après :</strong> <a href="${escapeHtml(generation.imageUrl ?? "")}">${escapeHtml(generation.imageUrl ?? "—")}</a></li>
    </ul>
  `;

  const text = [
    "Signalement d'image générée",
    `Date : ${timestamp}`,
    "",
    `Utilisateur : ${user.email ?? "—"} (${user.uid})`,
    `Génération : ${generation.id}`,
    `Mode : ${modeLabel} | Pièce : ${roomLabel} | Style : ${styleLabel}`,
    generation.propertyId ? `Bien : ${generation.propertyId}` : null,
    `Motif : ${reasonLabel}`,
    comment ? `Commentaire : ${comment}` : null,
    "",
    `Avant : ${generation.baseImageUrl ?? "—"}`,
    `Après : ${generation.imageUrl ?? "—"}`,
  ]
    .filter(Boolean)
    .join("\n");

  const transporter = getTransporter();
  await transporter.sendMail({
    from: config.from,
    to: config.reportTo,
    subject,
    text,
    html,
  });
}
