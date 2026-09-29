"use client";

import { Message } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Brain, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: Pick<Message, "id" | "role" | "content">;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  let displayContent = message.content;
  let reasoningContent = "";
  
  if (!isUser) {
    const thinkStart = message.content.indexOf("<think>");
    const thinkEnd = message.content.indexOf("</think>");
    
    if (thinkStart !== -1) {
      if (thinkEnd !== -1) {
        reasoningContent = message.content.slice(thinkStart + 7, thinkEnd).trim();
        displayContent = message.content.slice(0, thinkStart) + message.content.slice(thinkEnd + 8);
      } else {
        reasoningContent = message.content.slice(thinkStart + 7).trim();
        displayContent = message.content.slice(0, thinkStart);
      }
    }
  }

  return (
    <div
      className={cn(
        "group relative flex gap-4 px-4 py-6 sm:px-6 w-full max-w-4xl mx-auto",
        isUser ? "" : "bg-muted/50 rounded-2xl"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-xl border shadow-sm",
          isUser
            ? "bg-background border-border"
            : "bg-primary border-primary text-primary-foreground"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
      </div>
      
      <div className="flex-1 space-y-2 overflow-hidden px-1">
        {!isUser && reasoningContent && (
          <details className="mb-4 border rounded-lg bg-background/50 overflow-hidden [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center gap-2 px-4 py-2 cursor-pointer text-xs font-medium text-muted-foreground hover:bg-muted transition-colors select-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
              Reasoning Process
            </summary>
            <div className="px-4 py-3 text-sm text-muted-foreground border-t whitespace-pre-wrap font-mono bg-muted/20">
              {reasoningContent}
            </div>
          </details>
        )}
        <div className="prose prose-sm dark:prose-invert max-w-none break-words leading-relaxed">
          {isUser ? (
            <p className="whitespace-pre-wrap">{displayContent}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                pre: ({ node, ...props }: any) => {
                  const codeChunk = props?.children?.props?.children;
                  const codeString = typeof codeChunk === 'string' ? codeChunk : '';
                  return (
                    <div className="relative overflow-hidden w-full my-4 bg-zinc-950 dark:bg-zinc-900 rounded-lg border group/code">
                      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-white/10 text-xs text-zinc-400">
                        <span className="font-mono">code</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-white/10"
                          onClick={() => {
                            if (codeString) {
                              navigator.clipboard.writeText(codeString);
                            }
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                        </Button>
                      </div>
                      <div className="overflow-auto w-full p-4">
                        <pre {...props} className="m-0 text-zinc-50 bg-transparent" />
                      </div>
                    </div>
                  );
                },
                code: ({ node, inline, className, children, ...props }: any) => {
                  if (inline) {
                    return (
                      <code className="bg-muted px-1.5 py-0.5 rounded-md font-mono text-sm" {...props}>
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code className="block bg-transparent text-sm font-mono" {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {displayContent}
            </ReactMarkdown>
          )}
        </div>
        
        {!isUser && (
          <div className="flex items-center gap-1 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Copy response"
              onClick={() => navigator.clipboard.writeText(displayContent)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Good response"
              onClick={() => {
                import("@/server/actions/chat-actions").then(m => m.submitFeedbackAction(message.id, "up")).catch(console.error);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Bad response"
              onClick={() => {
                import("@/server/actions/chat-actions").then(m => m.submitFeedbackAction(message.id, "down")).catch(console.error);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"/></svg>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
