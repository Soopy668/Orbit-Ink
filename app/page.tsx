"use client"; // This MUST be at the very top

import { useState } from "react";

export default function ChatPage() {
  const [inputState, setInputState] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!inputState.trim()) return;

    // 1. Add user message to UI
    const newUserMessage = { role: "user", content: inputState };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputState("");
    setIsTyping(true);

    try {
      // 2. Call your Gemini API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputState }),
      });

      const data = await response.json();

      if (response.ok) {
        // 3. Add AI message to UI (using 'text' or 'content' from our backend)
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.text || data.content },
        ]);
      } else {
        console.error("API Error:", data.error);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Error: " + data.error },
        ]);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <main style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Orbit Ink</h1>
      
      <div style={{ border: "1px solid #ccc", height: "400px", overflowY: "scroll", padding: "1rem", marginBottom: "1rem" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: "10px", textAlign: msg.role === "user" ? "right" : "left" }}>
            <strong>{msg.role}:</strong> {msg.content}
          </div>
        ))}
        {isTyping && <p>AI is thinking...</p>}
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <input
          value={inputState}
          onChange={(e) => setInputState(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          style={{ flex: 1, padding: "10px", color: "black" }}
        />
        <button onClick={handleSend} style={{ padding: "10px 20px" }}>Send</button>
      </div>
    </main>
  );
}
