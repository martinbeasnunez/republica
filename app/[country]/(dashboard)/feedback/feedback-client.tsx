"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Send,
  Loader2,
  Bot,
  CheckCircle2,
  ArrowRight,
  Home,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { useCountry } from "@/lib/config/country-context";
import Link from "next/link";

// =============================================================================
// TYPES
// =============================================================================

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// =============================================================================
// CONFIG
// =============================================================================

const SUGGESTED_PROMPTS = [
  "Me gustó mucho el quiz",
  "Tengo una idea para la plataforma",
  "Encontré un error",
  "Quiero dar mi opinión",
];

// =============================================================================
// COMPONENT
// =============================================================================

export default function FeedbackClient() {
  const country = useCountry();
  const [query, setQuery] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const responseRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [streamingContent, messages]);

  // ─── Send chat message ─────────────────────────────────
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
          countryCode: country.code,
          mode: "feedback",
        }),
      });

      if (!res.ok) throw new Error("Error de conexión");

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
      setError("CONDOR no disponible en este momento. Intenta de nuevo.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsStreaming(false);
    }
  };

  // ─── Submit feedback ───────────────────────────────────
  const handleSubmitFeedback = async () => {
    if (messages.length < 2 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          countryCode: country.code,
        }),
      });

      if (!res.ok) throw new Error("Error al enviar");
      setIsSubmitted(true);
    } catch {
      setError("No se pudo enviar el feedback. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasResponse = messages.length > 0 || streamingContent;
  const canSubmitFeedback =
    messages.filter((m) => m.role === "user").length >= 1 &&
    !isStreaming &&
    !isSubmitted;

  // ─── Submitted state ───────────────────────────────────
  if (isSubmitted) {
    return (
      <div className="space-y-6">
        <Header />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-emerald/20 bg-emerald/5 p-8 text-center space-y-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald/10">
              <CheckCircle2 className="h-8 w-8 text-emerald" />
            </div>
          </motion.div>
          <h2 className="text-lg font-bold text-foreground">
            &#161;Gracias por tu feedback!
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Tu opinión nos ayuda a construir una mejor herramienta para la
            democracia. CONDOR procesará tus sugerencias.
          </p>
          <Link
            href={`/${country.code}`}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Home className="h-4 w-4" />
            Volver al inicio
          </Link>
        </motion.div>
      </div>
    );
  }

  // ─── Main render ───────────────────────────────────────
  return (
    <div className="space-y-6">
      <Header />

      {/* Chat area */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={cn(
          "rounded-xl border bg-card transition-all duration-300",
          isFocused ? "border-primary/40 glow-indigo" : "border-border"
        )}
      >
        {/* Input form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex items-center gap-3 px-4 py-3"
        >
          <MessageSquare className="h-5 w-5 text-primary flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Cuéntale a CONDOR qué piensas de la plataforma..."
            className="flex-1 bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
            disabled={isStreaming || isSubmitting}
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

        {/* Messages */}
        <AnimatePresence>
          {hasResponse && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="border-t border-border px-4 py-3">
                <div
                  ref={responseRef}
                  className="max-h-[400px] overflow-y-auto custom-scrollbar space-y-2"
                >
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex gap-2",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
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

                {/* Submit feedback button */}
                {canSubmitFeedback && (
                  <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-muted-foreground">
                      CONDOR AI &middot; Feedback mode
                    </span>
                    <button
                      onClick={handleSubmitFeedback}
                      disabled={isSubmitting}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald/10 border border-emerald/20 px-3 py-1.5 text-xs font-medium text-emerald hover:bg-emerald/20 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                      Enviar mi feedback
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
          transition={{ delay: 0.3 }}
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

      {/* Info */}
      <p className="text-[10px] text-muted-foreground/50 text-center font-mono">
        Tu feedback es procesado por IA para extraer sugerencias de producto. No se recopilan datos personales.
      </p>
    </div>
  );
}

// =============================================================================
// HEADER
// =============================================================================

function Header() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <MessageSquare className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Chatea con CONDOR
          </h1>
          <p className="text-xs text-muted-foreground">
            Tu feedback ayuda a construir la plataforma
          </p>
        </div>
      </div>
    </div>
  );
}
