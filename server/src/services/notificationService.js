import { getEmailConfig } from "../config.js";
import { getConfigCacheSync, ensureConfigCache } from "./configStore.js";
import { sendRawEmail } from "./emailService.js";

export async function getAdminNotificationConfig() {
  await ensureConfigCache();
  return (
    getConfigCacheSync().adminNotifications ?? {
      emails: [],
      slackWebhookUrl: null,
      triggers: { newReport: true, webhookError: true, usageSpike: false },
    }
  );
}

export async function notifyAdmins({ trigger, subject, text, html }) {
  const config = await getAdminNotificationConfig();
  if (!config.triggers?.[trigger]) return;

  const promises = [];

  if (config.emails?.length && getEmailConfig().configured) {
    for (const to of config.emails) {
      promises.push(
        sendRawEmail({ to, subject, text, html }).catch((err) =>
          console.error("Notification admin email:", err.message),
        ),
      );
    }
  }

  if (config.slackWebhookUrl) {
    promises.push(
      fetch(config.slackWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `${subject}\n${text}` }),
      }).catch((err) => console.error("Notification Slack:", err.message)),
    );
  }

  await Promise.all(promises);
}
