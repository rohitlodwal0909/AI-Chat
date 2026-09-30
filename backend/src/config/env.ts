import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 5000,

  openaiApiKey: process.env.OPENAI_API_KEY || "",
};

if (!env.openaiApiKey) {
  throw new Error("OPENAI_API_KEY is missing");
}