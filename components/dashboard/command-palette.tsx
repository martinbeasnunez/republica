"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Users,
  Map,
  BarChart3,
  Newspaper,
  ShieldCheck,
  FileText,
  HelpCircle,
  Radio,
  LayoutDashboard,
  Sparkles,
  Loader2,
  Bot,
  User,
} from "lucide-react";
import { candidates } from "@/lib/data/candidates";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"search" | "ai">("search");
  const [aiQuery, setAiQuery] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  // Reset mode when closing
  useEffect(() => {
    if (!open) {
      setMode("search");
    }
  }, [open]);

  // Scroll chat to bottom
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages, streamingContent]);

  const runCommand = (command: () => void) => {
    onOpenChange(false);
    command();
  };

  const handleAiSubmit = async () => {
    if (!aiQuery.trim() || isStreaming) return;

    const userMessage: ChatMessage = { role: "user", content: aiQuery };
    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setAiQuery("");
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

      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: fullContent },
      ]);
      setStreamingContent("");
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Lo siento, hubo un error al procesar tu consulta. Intenta de nuevo.",
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  if (mode === "ai") {
    return (
      <CommandDialog open={open} onOpenChange={onOpenChange}>
        <div className="flex flex-col h-[450px]">
          {/* AI Header */}
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              AGORA AI
            </span>
            <span className="text-[10px] text-muted-foreground">
              — Asistente electoral
            </span>
            <button
              onClick={() => {
                setMode("search");
                setChatMessages([]);
              }}
              className="ml-auto text-xs text-muted-foreground hover:text-foreground"
            >
              Volver a busqueda
            </button>
          </div>

          {/* Chat messages */}
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar"
          >
            {chatMessages.length === 0 && !streamingContent && (
              <div className="text-center py-8">
                <Bot className="h-10 w-10 text-primary/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Preguntame sobre candidatos, propuestas, encuestas o el
                  proceso electoral Peru 2026
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {[
                    "Quien lidera las encuestas?",
                    "Que propone Lopez Aliaga?",
                    "Cuando son las elecciones?",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setAiQuery(q);
                      }}
                      className="rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-2",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-primary/20">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-lg px-3 py-2 text-xs leading-relaxed max-w-[85%]",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-muted">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}

            {/* Streaming content */}
            {streamingContent && (
              <div className="flex gap-2 justify-start">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-primary/20">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="rounded-lg bg-muted px-3 py-2 text-xs leading-relaxed max-w-[85%] text-foreground">
                  {streamingContent}
                  <span className="inline-block w-1.5 h-3.5 bg-primary ml-0.5 animate-pulse" />
                </div>
              </div>
            )}

            {isStreaming && !streamingContent && (
              <div className="flex gap-2 justify-start">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-primary/20">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                </div>
              </div>
            )}
          </div>

          {/* AI Input */}
          <div className="border-t border-border p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAiSubmit();
              }}
              className="flex gap-2"
            >
              <input
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Pregunta algo sobre las elecciones..."
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                disabled={isStreaming}
                autoFocus
              />
              <button
                type="submit"
                disabled={!aiQuery.trim() || isStreaming}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors"
              >
                {isStreaming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Enviar"
                )}
              </button>
            </form>
          </div>
        </div>
      </CommandDialog>
    );
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Buscar candidatos, secciones, regiones..." />
      <CommandList>
        <CommandEmpty>No se encontraron resultados.</CommandEmpty>

        {/* AI Assistant shortcut */}
        <CommandGroup heading="Inteligencia Artificial">
          <CommandItem
            value="AGORA AI asistente electoral"
            onSelect={() => setMode("ai")}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium">Preguntale a AGORA AI</span>
            <span className="ml-auto text-[10px] text-muted-foreground">
              GPT-4o
            </span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Candidatos">
          {candidates.map((candidate) => (
            <CommandItem
              key={candidate.id}
              value={candidate.name}
              onSelect={() =>
                runCommand(() =>
                  router.push(`/candidatos/${candidate.slug}`)
                )
              }
            >
              <div
                className="mr-2 h-3 w-3 rounded-full"
                style={{ backgroundColor: candidate.partyColor }}
              />
              <span>{candidate.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {candidate.party}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Secciones">
          {[
            { name: "Dashboard", icon: LayoutDashboard, href: "/" },
            { name: "Candidatos", icon: Users, href: "/candidatos" },
            { name: "Mapa Electoral", icon: Map, href: "/mapa" },
            { name: "Encuestas", icon: BarChart3, href: "/encuestas" },
            { name: "Noticias", icon: Newspaper, href: "/noticias" },
            { name: "Verificador", icon: ShieldCheck, href: "/verificador" },
            { name: "Planes de Gobierno", icon: FileText, href: "/planes" },
            { name: "Quiz Electoral", icon: HelpCircle, href: "/quiz" },
            { name: "En Vivo", icon: Radio, href: "/en-vivo" },
          ].map((item) => (
            <CommandItem
              key={item.href}
              value={item.name}
              onSelect={() => runCommand(() => router.push(item.href))}
            >
              <item.icon className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{item.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
