import ChatMessage from "./ChatMessage";
import type { Message } from "../App";

interface ChatWindowProps {
  messages: Message[];
}

const ChatWindow = ({ messages }: ChatWindowProps) => {
  return (
    <div className="messages-container">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
    </div>
  );
};

export default ChatWindow;
