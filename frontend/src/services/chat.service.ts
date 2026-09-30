import axios from "axios";
import { Message } from "../types/chat";

const API_URL = import.meta.env.VITE_API_URL;

interface ChatResponse {
  success: boolean;
  data: {
    message: string;
  };
}

export const sendMessage = async (
  messages: Message[]
): Promise<string> => {
  const response = await axios.post<ChatResponse>(
    `${API_URL}/chat`,
    {
      messages: messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    }
  );

  return response.data.data.message;
};