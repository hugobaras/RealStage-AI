import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { collectKnowledgeChunks } from "../src/services/ragKnowledge.js";
import { embedTexts } from "../src/services/mistralService.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.resolve(__dirname, "../.env");
dotenv.config({ path: ENV_PATH });

const OUTPUT_PATH = process.env.RAG_INDEX_PATH?.trim()
  ? path.isAbsolute(process.env.RAG_INDEX_PATH)
    ? process.env.RAG_INDEX_PATH
    : path.resolve(path.dirname(ENV_PATH), process.env.RAG_INDEX_PATH)
  : path.resolve(__dirname, "../data/rag/index.json");

const BATCH_SIZE = 16;

async function main() {
  if (!process.env.MISTRAL_API_KEY?.trim()) {
    console.error("MISTRAL_API_KEY requise pour construire l'index RAG.");
    process.exit(1);
  }

  console.log("Collecte des chunks de connaissances…");
  const chunks = await collectKnowledgeChunks();
  console.log(`${chunks.length} chunks collectés.`);

  const embedded = [];
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    console.log(
      `Embeddings ${i + 1}-${Math.min(i + BATCH_SIZE, chunks.length)} / ${chunks.length}…`,
    );
    const vectors = await embedTexts(batch.map((c) => c.text));
    for (let j = 0; j < batch.length; j += 1) {
      embedded.push({ ...batch[j], embedding: vectors[j] });
    }
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  const payload = {
    version: 1,
    builtAt: new Date().toISOString(),
    chunkCount: embedded.length,
    chunks: embedded,
  };
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(payload));
  console.log(`Index RAG écrit : ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
