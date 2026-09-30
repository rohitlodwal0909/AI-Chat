import { useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
}

const ChatInput = ({ onSend }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const value = message.trim();

    if (!value) return;

    onSend(value);
    setMessage("");
  };

  return (
    <form className="chat-input-container" onSubmit={handleSubmit}>
      <button type="button" className="input-action">
        ＋
      </button>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Message Neura..."
        rows={1}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />

      <div className="input-actions">
        <button type="button" className="input-action">
          ✧
        </button>

        <button
          type="submit"
          className={`send-button ${message.trim() ? "active" : ""}`}
        >
          ↑
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
