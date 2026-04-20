"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, UIMessage } from "ai";
import { useF1Store } from "@/store/f1Store";

export default function VoicePage() {
  const { driverStandings, constructorStandings } = useF1Store();
  const endRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [input, setInput] = useState("");

  // Prepare context from real live API data to inject into LLM
  const f1Context = useMemo(() => ({
    topDrivers: driverStandings.slice(0, 5).map(d => ({
      name: `${d.Driver.givenName} ${d.Driver.familyName}`,
      points: d.points,
      team: d.Constructors[0]?.name
    })),
    topTeams: constructorStandings.slice(0, 3).map(c => ({
      name: c.Constructor.name,
      points: c.points
    }))
  }), [driverStandings, constructorStandings]);

  // In ai v6.0, transport is handled explicitly.
  const transport = useMemo(() => new DefaultChatTransport({
    api: "/api/chat",
    body: { f1Context }
  }), [f1Context]);

  // Define initial messages with explicit role typing to prevent TS narrowing
  const initialMessages: UIMessage[] = useMemo(() => [
    { 
      id: "1", 
      role: "system", 
      parts: [{ type: "text", text: "Hello Tejas! I'm your live F1 AI assistant. I have access to current standings and telemetry. Ask me who is leading, or ask for a championship prediction. 🏎️" }] 
    }
  ], []);

  const { messages, sendMessage, status } = useChat({
    transport,
    messages: initialMessages,
  });

  const isActuallyLoading = status === 'submitted' || status === 'streaming';

  useEffect(() => { 
    endRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [messages, isActuallyLoading]);

  const QUICK_QUESTIONS = [
    "Who is currently leading the championship?",
    "Predict the constructor champion",
    "What is the points gap between P1 and P2?",
    "Analyze McLaren's performance",
  ];

  const handleQuickQuestion = (q: string) => {
    sendMessage({ text: q });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isActuallyLoading) return;
    const currentInput = input;
    setInput("");
    await sendMessage({ text: currentInput });
  };

  return (
    <div className="max-w-[900px] mx-auto px-4 md:px-8 py-8 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Mic size={24} className="text-[var(--f1-red)]" />
        <h1 className="font-orbitron font-black text-3xl text-gradient tracking-widest uppercase">
          LIVE AI ASSISTANT
        </h1>
        <div className="h-px flex-1 bg-gradient-to-r from-[var(--f1-red)] to-transparent" />
      </div>

      {/* Chat Container */}
      <div className="card-base overflow-hidden mb-4"
        style={{ clipPath: "polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,0 100%)" }}>
        <div className="px-5 py-4 border-b-2 border-[var(--f1-red)] bg-[rgba(225,6,0,0.06)] flex items-center gap-3">
          <Volume2 size={14} className="text-[var(--f1-red)]" />
          <div className="font-orbitron font-bold text-sm text-white tracking-widest">PIT WALL GEMINI ENGINE</div>
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="live-dot w-1.5 h-1.5" />
            <span className="font-mono text-[10px] text-green-400 tracking-widest">LIVE RAG CONNECTED</span>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[400px] overflow-y-auto p-5 space-y-4 scrollbar-hide">
          {messages.map((msg) => (
            <motion.div key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === ("user" as string) ? "flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-orbitron font-black text-[10px] ${
                msg.role === "system" || msg.role === "assistant" ? "bg-[var(--f1-red)]" : "bg-[var(--f1-gray)]"
              }`}>
                {msg.role === "system" || msg.role === "assistant" ? "AI" : "T"}
              </div>
              <div className={`max-w-[80%] p-3 font-rajdhani text-sm leading-relaxed ${msg.role === "system" || msg.role === "assistant"
                  ? "bg-[var(--f1-dark)] border border-[var(--f1-gray)] text-white"
                  : "bg-[rgba(225,6,0,0.15)] border border-[var(--f1-red)]/30 text-white"
                }`}
                style={{ clipPath: msg.role === "system" || msg.role === "assistant" ? "polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)" : "polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px))" }}>
                {msg.parts.map((part, pIdx) => (
                  <span key={pIdx}>
                    {part.type === 'text' && part.text}
                    {part.type === 'reasoning' && <em className="block text-xs opacity-60 mb-1">{part.text}</em>}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}

          {isActuallyLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--f1-red)] flex items-center justify-center font-orbitron font-black text-[10px]">AI</div>
              <div className="p-3 bg-[var(--f1-dark)] border border-[var(--f1-gray)]"
                style={{ clipPath: "polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)" }}>
                <div className="flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-1.5 h-1.5 bg-[var(--f1-red)] rounded-full"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          <div ref={endRef} />
        </div>

        {/* Quick questions */}
        <div className="px-5 pb-3 flex gap-2 flex-wrap border-t border-[var(--f1-gray)] pt-3">
          {QUICK_QUESTIONS.map(q => (
            <button key={q} onClick={() => handleQuickQuestion(q)}
              className="font-mono text-[10px] tracking-widest text-[var(--f1-gray-light)] border border-[var(--f1-gray)] px-3 py-1.5 hover:border-[var(--f1-red)] hover:text-white transition-all"
              style={{ clipPath: "polygon(3px 0,100% 0,100% calc(100% - 3px),calc(100% - 3px) 100%,0 100%,0 3px)" }}>
              {q}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleFormSubmit} className="px-5 pb-5 flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about the live F1 session..."
            className="flex-1 bg-[var(--f1-darker)] border border-[var(--f1-gray)] text-white font-rajdhani text-sm px-4 py-3 outline-none focus:border-[var(--f1-red)] placeholder:text-[var(--f1-gray-light)]"
            style={{ clipPath: "polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)" }}
            disabled={isActuallyLoading}
          />
          <button type="button" onClick={() => setIsListening(l => !l)}
            className={`p-3 border-2 transition-all ${isListening ? "border-[var(--f1-red)] bg-[var(--f1-red)] text-white animate-pulse" : "border-[var(--f1-gray)] text-[var(--f1-gray-light)] hover:border-[var(--f1-red)]"}`}
            style={{ clipPath: "polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)" }}>
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <button type="submit" disabled={isActuallyLoading}
            className="px-5 py-3 bg-[var(--f1-red)] text-white font-orbitron font-bold text-xs tracking-widest hover:bg-[var(--f1-red-bright)] transition-colors disabled:opacity-50"
            style={{ clipPath: "polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)" }}>
            SEND
          </button>
        </form>
      </div>

      <p className="font-mono text-[10px] text-[var(--f1-gray-light)] tracking-widest text-center">
        Powered by Google Gemini Flash · Vercel AI SDK · Live F1 Data Store
      </p>
    </div>
  );
}
