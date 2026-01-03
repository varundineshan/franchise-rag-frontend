"use client";
import { useState } from "react";
import Link from "next/link";

type Citation = { doc: string; pages: number[]; chunk_id?: string };
type Message = { role: "user" | "ai"; content: string; citations?: Citation[]; refused?: boolean };

export default function Home() {
  const [orgId, setOrgId] = useState("franchise_123");
  const [q, setQ] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: `Hello! I'm accessing the Ops Manual for franchise_123. What can I help you with today?` }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const ask = async () => {
    if (!q.trim()) return;
    
    const userMessage: Message = { role: "user", content: q };
    setMessages(prev => [...prev, userMessage]);
    setQ("");
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ org_id: orgId, question: q }),
      });
      const data = await res.json();
      
      const aiMessage: Message = {
        role: "ai",
        content: data.answer,
        citations: data.citations ?? [],
        refused: !!data.refused
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: "ai",
        content: "Sorry, I encountered an error. Please try again."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      ask();
    }
  };

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: "var(--bg-main)" }}>
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4" style={{ backgroundColor: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)" }}>
        <div className="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10H12V2z"/>
            <path d="M12 12L2.1 12.1"/>
            <path d="M12 12l8.8-8.8"/>
          </svg>
          <span className="text-xl font-bold">FranchiseOps AI</span>
        </div>
        <nav>
          <Link href="/admin" className="text-sm font-medium transition-colors" style={{ color: "var(--text-secondary)" }} onMouseOver={(e) => e.currentTarget.style.color = "var(--accent-color)"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>Admin Portal →</Link>
        </nav>
      </header>

      {/* Context Bar */}
      <div className="flex items-center gap-4 px-8 py-3" style={{ backgroundColor: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)" }}>
        <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Active Context:</span>
        <input
          type="text"
          value={orgId}
          onChange={e => setOrgId(e.target.value)}
          placeholder="Enter Franchise ID..."
          className="px-4 py-2 rounded-lg font-mono text-sm outline-none transition-all"
          style={{ backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
          onFocus={(e) => { e.target.style.borderColor = "var(--accent-color)"; e.target.style.boxShadow = "0 0 0 2px rgba(59, 130, 246, 0.2)"; }}
          onBlur={(e) => { e.target.style.borderColor = "var(--border-color)"; e.target.style.boxShadow = "none"; }}
        />
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse ml-auto" : ""} max-w-4xl ${msg.role === "user" ? "ml-auto" : "mr-auto"}`}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold" style={{ backgroundColor: msg.role === "ai" ? "var(--accent-color)" : "var(--bg-tertiary)", color: msg.role === "ai" ? "white" : "var(--text-secondary)" }}>
              {msg.role === "ai" ? "AI" : "U"}
            </div>
            <div className="flex-1">
              <div className="px-5 py-4 rounded-xl" style={{ backgroundColor: msg.role === "user" ? "var(--accent-color)" : "var(--bg-secondary)", border: msg.role === "user" ? "none" : "1px solid var(--border-color)", color: msg.role === "user" ? "white" : "var(--text-primary)", borderBottomRightRadius: msg.role === "user" ? "4px" : "12px", borderBottomLeftRadius: msg.role === "ai" ? "4px" : "12px" }}>
                {msg.refused && <span className="text-xs opacity-75 block mb-2">(refused)</span>}
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border-color)" }}>
                    <div className="text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>CITATIONS</div>
                    <div className="flex flex-wrap gap-2">
                      {msg.citations.map((c, i) => (
                        <span key={i} className="px-3 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)" }}>
                          {c.doc} p.{c.pages?.[0]}–{c.pages?.[1]}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 max-w-4xl">
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold" style={{ backgroundColor: "var(--accent-color)", color: "white" }}>AI</div>
            <div className="px-5 py-4 rounded-xl" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "var(--text-secondary)", animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "var(--text-secondary)", animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "var(--text-secondary)", animationDelay: "300ms" }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Footer */}
      <div className="px-8 py-6" style={{ backgroundColor: "var(--bg-secondary)", borderTop: "1px solid var(--border-color)" }}>
        <div className="flex gap-4 max-w-4xl mx-auto">
          <input
            type="text"
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about the manual..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-lg outline-none transition-all"
            style={{ backgroundColor: "var(--bg-main)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
            onFocus={(e) => { e.target.style.borderColor = "var(--accent-color)"; e.target.style.boxShadow = "0 0 0 2px rgba(59, 130, 246, 0.2)"; }}
            onBlur={(e) => { e.target.style.borderColor = "var(--border-color)"; e.target.style.boxShadow = "none"; }}
          />
          <button
            onClick={ask}
            disabled={isLoading || !q.trim()}
            className="px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "var(--accent-color)", color: "white" }}
            onMouseOver={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = "var(--accent-hover)")}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "var(--accent-color)"}
          >
            Ask
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
