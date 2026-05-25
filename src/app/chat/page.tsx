"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Send, Loader2, Sparkles } from "lucide-react";
import { AmbientGlow } from "@/components/AmbientGlow";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const INIT_PROMPT = "用2-3句话问候我，根据我最新的训练和饮食数据说出今天最重要的一点。语气像了解我的私教，直接说重点。";

// ── Lightweight inline Markdown renderer ─────────────────────────────────────
function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*|`[^`\n]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**'))
      return <strong key={i} className="font-semibold">{p.slice(2, -2)}</strong>;
    if (p.startsWith('*') && p.endsWith('*'))
      return <em key={i}>{p.slice(1, -1)}</em>;
    if (p.startsWith('`') && p.endsWith('`'))
      return <code key={i} className="px-1 rounded text-xs" style={{ background: 'rgba(0,0,0,0.25)' }}>{p.slice(1, -1)}</code>;
    return p;
  });
}

function MessageContent({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {renderInline(line)}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </>
  );
}

export default function ChatPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const userName = session?.user?.name?.split(" ")[0] || "健身者";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [initDone, setInitDone] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const streamChat = useCallback(async (msgs: Message[]) => {
    setStreaming(true);
    const placeholder: Message = { role: "assistant", content: "" };
    setMessages(prev => [...prev, placeholder]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messages: msgs, userName }),
      });

      if (!res.ok || !res.body) {
        setMessages(prev => {
          const next = [...prev];
          next[next.length - 1] = { role: "assistant", content: "抱歉，AI暂时无法响应，请稍后再试。" };
          return next;
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed?.choices?.[0]?.delta?.content;
            if (delta) {
              accumulated += delta;
              setMessages(prev => {
                const next = [...prev];
                next[next.length - 1] = { role: "assistant", content: accumulated };
                return next;
              });
            }
          } catch { /* ignore parse errors */ }
        }
      }
    } finally {
      setStreaming(false);
    }
  }, [userName]);

  // Auto-send greeting on first load
  useEffect(() => {
    if (initDone || !session) return;
    setInitDone(true);
    const initMsgs: Message[] = [{ role: "user", content: INIT_PROMPT }];
    streamChat(initMsgs).then(() => {
      // Remove the hidden init user message, keep only AI response
      setMessages(prev => prev.filter(m => m.content !== INIT_PROMPT));
    });
  }, [session, initDone, streamChat]);

  const send = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages.filter(m => m.role === "user" || m.role === "assistant"), userMsg];
    setMessages(newMessages);
    await streamChat(newMessages);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)', fontFamily: "Inter, Space Grotesk, sans-serif" }}>
      {/* Fixed ambient glow */}
      <AmbientGlow />

      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center gap-4 px-4 py-3"
        style={{ background: 'var(--top-bg)', backdropFilter: "blur(16px)", borderBottom: "1px solid var(--border)" }}>
        <button onClick={() => router.back()} className="p-2 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)' }}>
            <Sparkles className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <div className="text-sm font-black" style={{ color: 'var(--accent)' }}>XFITX Coach</div>
            <div className="text-xs" style={{ color: streaming ? "var(--accent)" : 'var(--text-low)' }}>
              {streaming ? "正在思考…" : "你的专属私教"}
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 pb-36">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "var(--accent-dim)", border: "1px solid var(--accent-glow)" }}>
              <Sparkles className="w-7 h-7" style={{ color: "var(--accent)" }} />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "var(--accent)", animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "var(--accent)", animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "var(--accent)", animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-xl flex items-center justify-center mr-2 mt-0.5 shrink-0"
                style={{ background: "var(--accent-dim)", border: "1px solid var(--accent-glow)" }}>
                <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
              </div>
            )}
            <div
              className="max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
              style={msg.role === "user"
                ? { background: 'var(--accent)', color: 'var(--accent-text)', fontWeight: 600, borderBottomRightRadius: 6 }
                : { background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-high)', borderBottomLeftRadius: 6 }
              }
            >
              {msg.role === "assistant"
                ? <MessageContent content={msg.content} />
                : msg.content
              }
              {streaming && i === messages.length - 1 && msg.role === "assistant" && (
                <span className="inline-block w-0.5 h-4 ml-0.5 align-middle animate-pulse" style={{ background: "var(--accent)" }} />
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-4"
        style={{ background: 'var(--top-bg)', backdropFilter: "blur(20px)", borderTop: '1px solid var(--border)' }}>
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="问问你的私教…"
            disabled={streaming}
            className="flex-1 rounded-2xl px-4 py-3 text-sm outline-none"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-high)' }}
          />
          <button onClick={send} disabled={!input.trim() || streaming}
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all active:scale-95"
            style={{ background: input.trim() && !streaming ? 'var(--accent)' : 'var(--surface-3)' }}>
            {streaming
              ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--text-low)' }} />
              : <Send className="w-4 h-4" style={{ color: input.trim() ? 'var(--accent-text)' : 'var(--text-faint)' }} />
            }
          </button>
        </div>
      </div>
    </div>
  );
}
