import { useState } from "react";
import ChatInput from "./components/ChatInput";
import ChatWindow from "./components/ChatWindow";
import "./index.css";

export interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

const App = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  // const handleSend = (message: string) => {
  //   const userMessage: Message = {
  //     id: Date.now(),
  //     role: "user",
  //     content: message,
  //   };

  //   setMessages((prev) => [...prev, userMessage]);
  //   // Temporary AI response
  //   setTimeout(() => {
  //     const aiMessage: Message = {
  //       id: Date.now() + 1,
  //       role: "assistant",
  //       content:
  //         "I'm your AI assistant. Your message has been received successfully. Once we connect the Node.js backend, I can generate real AI responses.",
  //     };

  //     setMessages((prev) => [...prev, aiMessage]);
  //   }, 700);
  // };
  const handleSend = async (message: string) => {
    // User message
    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: message
    };

    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: [
            {
              role: "user",
              content: message
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.data.answer
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat API Error:", error);

      const errorMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: "Sorry, I couldn't connect to the AI server. Please try again."
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const newChat = () => {
    setMessages([]);
  };

  return (
    <div className="app-shell">
      {/* Background Effects */}
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-orb">
            <span>✦</span>
          </div>

          <div>
            <h2>Neura</h2>
            <span>AI Workspace</span>
          </div>
        </div>

        <button className="new-chat-btn" onClick={newChat}>
          <span>＋</span>
          New Conversation
        </button>

        <div className="sidebar-section">
          <span className="section-title">Workspace</span>

          <button className="side-item active">
            <span>◈</span>
            AI Assistant
          </button>

          <button className="side-item">
            <span>⌘</span>
            Explore AI
          </button>

          <button className="side-item">
            <span>◉</span>
            Saved Chats
          </button>
        </div>

        <div className="sidebar-section">
          <span className="section-title">Recent</span>

          <div className="recent-chat">
            <span>○</span>
            AI Development
          </div>

          <div className="recent-chat">
            <span>○</span>
            React Architecture
          </div>

          <div className="recent-chat">
            <span>○</span>
            Node.js API Design
          </div>
        </div>

        <div className="sidebar-bottom">
          <div className="user-card">
            <div className="user-avatar">R</div>

            <div>
              <strong>Developer</strong>
              <small>Pro Workspace</small>
            </div>

            <span>•••</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        {/* Header */}
        <header className="topbar">
          <div className="mobile-brand">
            <div className="brand-orb small">✦</div>
            <strong>Neura AI</strong>
          </div>

          <div className="model-info">
            <div className="ai-mini-orb">✦</div>

            <div>
              <strong>Neura Intelligence</strong>
              <span>
                <i />
                Online · Ready to help
              </span>
            </div>
          </div>

          <div className="top-actions">
            <button title="Search">⌕</button>
            <button title="Settings">⚙</button>
          </div>
        </header>

        {/* Chat Area */}
        <section className="chat-area">
          {messages.length === 0 ? (
            <div className="welcome">
              <div className="hero-orb">
                <div className="orb-ring ring-one" />
                <div className="orb-ring ring-two" />

                <div className="orb-core">✦</div>
              </div>

              <span className="eyebrow">NEXT GENERATION AI ASSISTANT</span>

              <h1>
                What can I help
                <br />
                <span>you create today?</span>
              </h1>

              <p>
                Ask questions, build applications, analyze data, generate ideas
                and solve complex problems with AI.
              </p>

              <div className="suggestions">
                <button
                  onClick={() => handleSend("Build a modern React application")}
                >
                  <span>⌘</span>
                  Build a React application
                </button>

                <button
                  onClick={() => handleSend("Explain Node.js architecture")}
                >
                  <span>◈</span>
                  Explain Node.js architecture
                </button>

                <button
                  onClick={() => handleSend("Help me learn Generative AI")}
                >
                  <span>✦</span>
                  Learn Generative AI
                </button>

                <button onClick={() => handleSend("Design an AI chatbot")}>
                  <span>◇</span>
                  Design an AI chatbot
                </button>
              </div>
            </div>
          ) : (
            <ChatWindow messages={messages} />
          )}
        </section>

        {/* Input */}
        <div className="input-wrapper">
          <ChatInput onSend={handleSend} />
          {loading && <div>AI is thinking...</div>}

          <div className="input-hint">
            <span>AI can make mistakes. Verify important information.</span>

            <div>
              <kbd>Enter</kbd>
              Send
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
