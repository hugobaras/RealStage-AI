import { getDiscordConfig, getStripeConfig } from "../config.js";
import { findSessionByDiscordThread } from "./chatSessionStore.js";
import { closeSession, relayAgentMessage } from "./chatService.js";

let client = null;
let bridgeError = null;

const CLOSE_PATTERN = /^!?(\/)?close\b/i;

function isCloseCommand(content) {
  return CLOSE_PATTERN.test(content?.trim() ?? "");
}

async function resolveDiscordAgentName(message) {
  let member = message.member;
  if (!member && message.guild) {
    member = await message.guild.members
      .fetch(message.author.id)
      .catch(() => null);
  }

  return member?.nickname ?? "Conseiller";
}

async function handleCloseRequest(session, replyChannel) {
  const { newSession } = await closeSession(session.id, { by: "agent" });
  await archiveDiscordThread(session.discordThreadId);

  if (replyChannel?.send) {
    await replyChannel
      .send(
        `✅ Conversation clôturée. L'utilisateur peut démarrer un nouveau chat sur le site.` +
          (newSession
            ? ` (nouvelle session : \`${newSession.id.slice(0, 8)}…\`)`
            : ""),
      )
      .catch(() => {});
  }
}

async function archiveDiscordThread(threadId) {
  if (!threadId || !client) return;
  await awaitReady();
  const thread = await client.channels.fetch(threadId).catch(() => null);
  if (!thread?.isThread?.()) return;
  await thread.setLocked(true).catch(() => {});
  await thread.setArchived(true).catch(() => {});
}

async function registerCloseSlashCommand(discordClient) {
  const config = getDiscordConfig();
  await awaitReady();

  const channel = await discordClient.channels
    .fetch(config.supportChannelId)
    .catch(() => null);
  const guildId = channel?.guildId;
  if (!guildId) {
    console.warn(
      "Discord: impossible d'enregistrer /close (guild introuvable).",
    );
    return;
  }

  const { REST, Routes, SlashCommandBuilder } = await import("discord.js");
  const rest = new REST().setToken(config.botToken);
  const appId = discordClient.user.id;

  await rest.put(Routes.applicationGuildCommands(appId, guildId), {
    body: [
      new SlashCommandBuilder()
        .setName("close")
        .setDescription("Clôturer le ticket support et libérer le client")
        .toJSON(),
    ],
  });

  console.log("Commande Discord /close enregistrée sur le serveur.");
}

export function isDiscordBridgeConfigured() {
  return getDiscordConfig().configured;
}

export function isDiscordBridgeReady() {
  return Boolean(client?.isReady());
}

export function getDiscordBridgeError() {
  return bridgeError;
}

export async function initDiscordBridge() {
  const config = getDiscordConfig();
  bridgeError = null;

  if (!config.configured) {
    console.warn(
      "Discord non configuré — escalade agent désactivée (DISCORD_BOT_TOKEN + DISCORD_SUPPORT_CHANNEL_ID).",
    );
    return null;
  }

  try {
    const { Client, GatewayIntentBits, Events, EmbedBuilder } =
      await import("discord.js");

    client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    client.once(Events.ClientReady, async (c) => {
      bridgeError = null;
      console.log(`Bot Discord connecté : ${c.user.tag}`);
      try {
        await registerCloseSlashCommand(c);
      } catch (err) {
        console.warn("Enregistrement /close:", err.message);
      }
    });

    client.on(Events.Error, (err) => {
      bridgeError = err.message;
      console.error("Discord client error:", err.message);
    });

    client.on(Events.InteractionCreate, async (interaction) => {
      if (
        !interaction.isChatInputCommand() ||
        interaction.commandName !== "close"
      ) {
        return;
      }

      if (!interaction.channel?.isThread()) {
        await interaction.reply({
          content: "Utilisez /close dans le fil du ticket support.",
          ephemeral: true,
        });
        return;
      }

      const session = await findSessionByDiscordThread(interaction.channel.id);
      if (!session) {
        await interaction.reply({
          content: "Aucun ticket actif pour ce fil.",
          ephemeral: true,
        });
        return;
      }

      await interaction.deferReply({ ephemeral: true });
      await handleCloseRequest(session, interaction.channel);
      await interaction.editReply(
        "Ticket clôturé. Le client a reçu une nouvelle conversation.",
      );
    });

    client.on(Events.MessageCreate, async (message) => {
      if (message.author.bot || !message.channel.isThread()) return;

      const session = await findSessionByDiscordThread(message.channel.id);
      if (!session) return;

      const content = message.content?.trim();
      if (!content) return;

      if (isCloseCommand(content)) {
        await handleCloseRequest(session, message.channel);
        await message.react("✅").catch(() => {});
        return;
      }

      const agentName = await resolveDiscordAgentName(message);
      await relayAgentMessage(session.id, content, agentName);
    });

    await client.login(config.botToken);
    return client;
  } catch (err) {
    bridgeError = err.message;
    client = null;
    if (err.message?.includes("disallowed intents")) {
      console.error(
        "Échec connexion Discord: intent « Message Content » non activé.\n" +
          "  → https://discord.com/developers/applications → votre app → Bot\n" +
          "  → Privileged Gateway Intents → activer « MESSAGE CONTENT INTENT » → Save\n" +
          "  → puis redémarrer le serveur (npm run dev).",
      );
    } else {
      console.error("Échec connexion Discord:", err.message);
    }
    throw err;
  }
}

function awaitReady() {
  if (!client) throw new Error("Bot Discord non initialisé.");
  if (client.isReady()) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("Discord timeout")),
      15000,
    );
    client.once("ready", () => {
      clearTimeout(timeout);
      resolve();
    });
  });
}

export async function createAgentThread(session) {
  if (!isDiscordBridgeConfigured()) return null;

  const { EmbedBuilder } = await import("discord.js");
  const config = getDiscordConfig();

  await awaitReady();
  const channel = await client.channels.fetch(config.supportChannelId);
  if (!channel?.isTextBased()) {
    throw new Error("Canal Discord support invalide.");
  }

  const shortId = session.id.slice(0, 8);
  const safeEmail = (session.email ?? "user").replace(/[^a-zA-Z0-9@._-]/g, "_");
  const threadName = `support-${safeEmail}-${shortId}`.slice(0, 100);

  const starter = await channel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("Nouvelle demande support RealStage AI")
        .setColor(0x6366f1)
        .addFields(
          {
            name: "Utilisateur",
            value: session.email ?? session.uid,
            inline: true,
          },
          { name: "UID", value: session.uid, inline: true },
          { name: "Session", value: session.id, inline: false },
        )
        .setFooter({
          text: "Répondez dans ce fil. /close ou tapez close pour clôturer.",
        }),
    ],
  });

  const thread = await starter.startThread({
    name: threadName,
    autoArchiveDuration: 1440,
    reason: "Escalade chat support",
  });

  const { updateSession } = await import("./chatSessionStore.js");
  await updateSession(session.id, { discordThreadId: thread.id });

  await thread.send(
    "👋 Ticket ouvert. Répondez ici pour joindre le client.\n" +
      "Pour clôturer : commande **/close** ou message `close`.",
  );

  return thread.id;
}

export async function relayUserMessageToDiscord(session, content) {
  if (!session.discordThreadId || !client) return;

  await awaitReady();
  const thread = await client.channels.fetch(session.discordThreadId);
  if (!thread?.isTextBased()) return;

  await thread.send({
    content: `**${session.email ?? "Utilisateur"}** : ${content}`,
  });
}

export async function shutdownDiscordBridge() {
  if (client) {
    await client.destroy();
    client = null;
  }
}
