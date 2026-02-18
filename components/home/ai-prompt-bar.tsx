"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Loader2, Bot, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_PROMPTS = [
  "Quien lidera las encuestas?",
  "Es verdad que las elecciones se adelantan?",
  "Compara los planes de seguridad",
  "Analiza las noticias de hoy",
];

export function AIPromptBar() {
  const [query, setQuery] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const responseRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [streamingContent, messages]);

  const handleSubmit = async (promptOverride?: string) => {
    const text = promptOverride || query.trim();
    if (!text || isStreaming) return;

    setError(null);
    const userMessage: ChatMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setQuery("");
    setIsStreaming(true);
    setStreamingContent("");

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) throw new Error("Error de conexion");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          const lines = text.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullContent += parsed.content;
                  setStreamingContent(fullContent);
                }
              } catch {
                // skip parse errors
              }
            }
          }
        }
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: fullContent },
      ]);
      setStreamingContent("");
    } catch {
      setError("CONDOR AI no disponible en este momento. Intenta de nuevo.");
      setMessages((prev) => prev.slice(0, -1)); // remove user message on error
    } finally {
      setIsStreaming(false);
    }
  };

  const hasResponse = messages.length > 0 || streamingContent;
  const lastAssistantMessage = [...messages].reverse().find((m) => m.role === "assistant");

  return (
    <div className="space-y-3">
      {/* Prompt input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={cn(
          "rounded-xl border bg-card transition-all duration-300",
          isFocused ? "border-primary/40 glow-indigo" : "border-border"
        )}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex items-center gap-3 px-4 py-3"
        >
          <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Preguntale algo a CONDOR AI sobre las elecciones..."
            className="flex-1 bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
            disabled={isStreaming}
          />
          <button
            type="submit"
            disabled={!query.trim() || isStreaming}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-30 hover:bg-primary/90 transition-all flex-shrink-0"
          >
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>

        {/* Inline response area */}
        <AnimatePresence>
          {hasResponse && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="border-t border-border px-4 py-3">
                <div ref={responseRef} className="max-h-[320px] overflow-y-auto custom-scrollbar space-y-2">
                  {messages.map((msg, i) => (
                    <div key={i} className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
                      {msg.role === "assistant" && (
                        <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-primary/20 mt-0.5">
                          <Bot className="h-3 w-3 text-primary" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "rounded-lg px-3 py-1.5 text-xs leading-relaxed max-w-[85%]",
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        )}
                      >
                        {msg.role === "assistant" ? (
                          <div className="ai-prose">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        ) : (
                          msg.content
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Streaming */}
                  {streamingContent && (
                    <div className="flex gap-2 justify-start">
                      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-primary/20 mt-0.5">
                        <Bot className="h-3 w-3 text-primary" />
                      </div>
                      <div className="rounded-lg bg-muted px-3 py-1.5 text-xs leading-relaxed max-w-[85%] text-foreground">
                        <div className="ai-prose">
                          <ReactMarkdown>{streamingContent}</ReactMarkdown>
                        </div>
                        <span className="inline-block w-1.5 h-3 bg-primary ml-0.5 animate-pulse" />
                      </div>
                    </div>
                  )}

                  {isStreaming && !streamingContent && (
                    <div className="flex gap-2 justify-start">
                      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-primary/20 mt-0.5">
                        <Bot className="h-3 w-3 text-primary" />
                      </div>
                      <div className="rounded-lg bg-muted px-3 py-1.5 text-xs text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Continue in full AI */}
                {lastAssistantMessage && !isStreaming && (
                  <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-muted-foreground">
                      Powered by CONDOR AI
                    </span>
                    <button
                      onClick={() => {
                        setMessages([]);
                        setStreamingContent("");
                        inputRef.current?.focus();
                      }}
                      className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      Hacer otra pregunta
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-rose text-center"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Suggested prompts */}
      {!hasResponse && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-2"
        >
          {SUGGESTED_PROMPTS.map((prompt) => (
            <motion.button
              key={prompt}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSubmit(prompt)}
              disabled={isStreaming}
              className="rounded-lg border border-border bg-card/50 px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground hover:border-primary/20 transition-all disabled:opacity-50"
            >
              {prompt}
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
