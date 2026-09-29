"use client";

import { useEffect, useRef } from "react";
import { Message } from "ai";
import { ChatMessage } from "./chat-message";
import { AlertCircle, Brain, Loader2, RefreshCcw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface MessageListProps {
  messages: Pick<Message, "id" | "role" | "content">[];
  isLoading?: boolean;
  error?: Error | undefined;
  reload?: () => void;
}

export function MessageList({ messages, isLoading, error, reload }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, error]);

  if (messages.length === 0 && !isLoading && !error) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg mb-6">
          <Brain className="h-8 w-8 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Send a message to start</h2>
        <p className="text-muted-foreground max-w-md">
          Chat with your models using text, markdown, or math formulas.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-8 pt-4">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      
      {!isLoading && reload && messages.length > 0 && messages[messages.length - 1]?.role === "assistant" && (
        <div className="flex justify-center pb-4 animate-in fade-in zoom-in duration-300">
          <Button variant="outline" size="sm" onClick={() => reload()} className="gap-2 rounded-full shadow-sm bg-background hover:bg-muted">
            <RefreshCcw className="h-3 w-3" />
            Regenerate response
          </Button>
        </div>
      )}

      {isLoading && messages[messages.length - 1]?.role === "user" && (
        <div className="flex gap-4 px-4 py-6 sm:px-6 w-full max-w-4xl mx-auto bg-muted/50 rounded-2xl animate-in fade-in">
          <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-xl border shadow-sm bg-primary border-primary text-primary-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 w-32 bg-muted-foreground/20 rounded animate-pulse" />
            <div className="h-4 w-24 bg-muted-foreground/20 rounded animate-pulse" />
          </div>
        </div>
      )}

      {error && (
        <div className="px-4 py-6 sm:px-6 w-full max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error.message || "An error occurred during your request."}
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div ref={bottomRef} className="h-px w-full" />
    </div>
  );
}
