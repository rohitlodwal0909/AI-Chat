// import OpenAI from "openai";

// const client = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// export async function createEmbedding(text: string) {
//   const response = await client.embeddings.create({
//     model: "text-embedding-3-small",
//     input: "Hello world",
//   });

//   return response.data[0].embedding;
// }

import { pipeline } from "@huggingface/transformers";

let extractor: any = null;

export async function generateEmbedding(text: string) {
  if (!extractor) {
    console.log("Loading embedding model...");

    extractor = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );

    console.log("Embedding model loaded");
  }

  const output = await extractor(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data) as number[];
}