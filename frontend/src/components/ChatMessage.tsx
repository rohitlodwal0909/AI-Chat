import type { Message } from "../App";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";
  console.log(message);

  return (
    <div className={`message-row ${isUser ? "user-message" : "ai-message"}`}>
      {!isUser && <div className="message-avatar">✦</div>}

      <div className="message-content">
        <div className="message-meta">
          <strong>{isUser ? "You" : "Neura AI"}</strong>

          <span>{isUser ? "Just now" : "AI generated"}</span>
        </div>

        <div className="message-bubble">{message.content}</div>

        {!isUser && (
          <div className="message-tools">
            <button>♡</button>
            <button>⧉</button>
            <button>↻</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
