import OpenAI from "openai";
import { env } from "../config/env";

const openai = new OpenAI({
  apiKey: env.openaiApiKey,
});

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export const generateAIResponse = async (
  messages: ChatMessage[]
): Promise<string> => {
  const response = await openai.chat.completions.create({
    model: "gpt-5.6-luna",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful AI assistant. Give clear, accurate and easy-to-understand answers.",
      },
      ...messages,
    ],

  });
  
  return response.choices[0]?.message?.content || "No response generated.";
};