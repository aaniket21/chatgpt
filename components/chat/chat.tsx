"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useChat } from "@ai-sdk/react";
import { Message } from "ai";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { ModelSwitcher } from "./model-switcher";
import { SystemPromptModal } from "./system-prompt-modal";
import { saveBrowserMessageAction } from "@/server/actions/chat-actions";
import { ChatHeaderActions } from "./chat-header-actions";

import { v4 as uuidv4 } from "uuid";

interface ChatProps {
  id?: string;
  initialMessages?: any[];
  currentConnectionId?: string;
  connections?: { id: string; name: string; provider: string; isDefault: boolean; mode?: string }[];
  systemPrompt?: string | null;
}

export function Chat({ id: chatId, initialMessages = [], currentConnectionId, connections = [], systemPrompt }: ChatProps) {
  const router = useRouter();
  const [newChatId] = useState(() => uuidv4());
  const effectiveId = chatId || newChatId;
  const activeConnection = connections.find(c => c.id === currentConnectionId) || connections.find(c => c.isDefault);
  const isBrowserMode = activeConnection?.mode === "browser";
  const [loadProgress, setLoadProgress] = useState("");

  const customFetch = isBrowserMode ? async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      // Dynamic import to avoid SSR issues
      const { getWebLLMEngine } = await import("@/lib/webllm");
      const engine = await getWebLLMEngine(activeConnection?.name || "Llama-3-8B-Instruct-q4f32_1-MLC", (progress, text) => {
        setLoadProgress(text);
      });
      setLoadProgress(""); // Clear when done

      const body = JSON.parse(init?.body as string);
      // Convert Vercel messages to OpenAI format (WebLLM uses exactly this)
      let messages = body.messages;

      if (systemPrompt && (messages.length === 0 || messages[0].role !== "system")) {
        messages = [{ role: "system", content: systemPrompt }, ...messages];
      }

      const stream = new ReadableStream({
        async start(controller) {
          try {
            const asyncChunkGenerator = await engine.chat.completions.create({
              stream: true,
              messages,
            });

            for await (const chunk of asyncChunkGenerator) {
              const content = chunk.choices[0]?.delta?.content || "";
              if (content) {
                // Vercel AI SDK data stream format for text is `0:"text"\n`
                controller.enqueue(new TextEncoder().encode(`0:${JSON.stringify(content)}\n`));
              }
            }
            controller.close();
          } catch (e: any) {
            controller.enqueue(new TextEncoder().encode(`3:${JSON.stringify(e.message)}\n`));
            controller.close();
          }
        }
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Vercel-AI-Data-Stream": "v1"
        }
      });
    } catch (e) {
      console.warn("Browser inference failed, falling back to server mode.", e);
      setLoadProgress("");
      // Fallback to server fetch
      return fetch(input, init);
    }
  } : undefined;

  const { id, messages, append, isLoading, error, stop, reload } = useChat({
    id: effectiveId,
    initialMessages,
    api: "/api/chat",
    body: { id: effectiveId, connectionId: activeConnection?.id },
    fetch: customFetch,
    onResponse: () => {
      if (!chatId) {
        router.refresh();
      }
    },
    onFinish: async (message) => {
      if (isBrowserMode && id) {
        // We only save the assistant message. The user message is saved below in handleMessageSubmit
        // Wait, Vercel AI SDK only calls onFinish with the assistant message
        let finalContent = message.content;
        let reasoning: string | null = null;
        
        const thinkMatch = message.content.match(/<think>([\s\S]*?)<\/think>/);
        if (thinkMatch) {
          reasoning = thinkMatch[1].trim();
          finalContent = message.content.replace(/<think>[\s\S]*?<\/think>/, "").trim();
        }

        try {
          await saveBrowserMessageAction(id, "assistant", finalContent, reasoning, 0, activeConnection?.id);
        } catch (e) {
          console.error("Failed to save assistant message", e);
        }
      }
    }
  });

  const handleMessageSubmit = async (content: string, files?: File[]) => {
    let finalContent = content;
    const imageAttachments: File[] = [];

    if (files && files.length > 0) {
      for (const file of files) {
        if (file.type.startsWith("image/")) {
          imageAttachments.push(file);
        } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
          try {
            const { extractTextFromPDF } = await import("@/utils/pdf-extractor");
            const text = await extractTextFromPDF(file);
            finalContent += `\n\n--- Attachment: ${file.name} ---\n${text}\n--- End of Attachment ---\n`;
          } catch (e) {
            console.error("Failed to read PDF file", file.name, e);
          }
        } else {
          // Read text files and append to prompt
          try {
            const text = await file.text();
            finalContent += `\n\n--- Attachment: ${file.name} ---\n${text}\n--- End of Attachment ---\n`;
          } catch (e) {
            console.error("Failed to read file", file.name, e);
          }
        }
      }
    }

    if (isBrowserMode && id) {
      try {
        await saveBrowserMessageAction(id, "user", finalContent, null, 0, activeConnection?.id);
      } catch (e) {
        console.error("Failed to save user message", e);
      }
    }

    append({
      role: "user",
      content: finalContent,
      ...(imageAttachments.length > 0 ? { experimental_attachments: imageAttachments as any } : {})
    });
  };

  useEffect(() => {
    if (messages.length > 0 && id && id !== "undefined" && typeof window !== "undefined" && window.location.pathname === "/") {
      window.history.replaceState(null, "", `/c/${id}`);
    }
  }, [messages.length, id]);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden relative">
      {id && connections.length > 0 && (
        <div className="absolute top-0 left-0 right-0 z-10 flex justify-center p-2 pointer-events-none gap-2">
          <div className="pointer-events-auto shadow-md rounded-md flex items-center gap-1">
            <ModelSwitcher 
              conversationId={id} 
              currentConnectionId={currentConnectionId} 
              connections={connections} 
            />
            <SystemPromptModal conversationId={id} initialPrompt={systemPrompt || ""} />
            <ChatHeaderActions conversationId={id} messages={messages} />
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto pt-10">
        <MessageList messages={messages} isLoading={isLoading} error={error} reload={reload} />
      </div>
      <div className="mt-auto bg-background/80 backdrop-blur-sm relative">
        {isLoading && (
          <div className="absolute -top-12 left-0 right-0 flex justify-center pointer-events-none">
            <button
              onClick={stop}
              className="pointer-events-auto flex items-center gap-2 bg-background border shadow-md rounded-full px-4 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/></svg>
              Stop generating
            </button>
          </div>
        )}
        
        {loadProgress && (
          <div className="absolute -top-12 left-0 right-0 flex justify-center pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-2 bg-background border shadow-md rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground animate-pulse">
              <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              {loadProgress}
            </div>
          </div>
        )}

        <ChatInput onSubmit={handleMessageSubmit} isLoading={isLoading || !!loadProgress} />
      </div>
    </div>
  );
}
