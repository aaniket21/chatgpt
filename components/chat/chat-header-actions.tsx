"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Share } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Message } from "ai";
import { generateSharedLinkAction, revokeSharedLinkAction } from "@/server/actions/chat-actions";

interface ChatHeaderActionsProps {
  conversationId: string;
  messages: Pick<Message, "id" | "role" | "content">[];
}

export function ChatHeaderActions({ conversationId, messages }: ChatHeaderActionsProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareLinkId, setShareLinkId] = useState("");

  const handleExport = (format: "md" | "json") => {
    let content = "";
    let mime = "";
    let filename = `chat-export-${new Date().toISOString().split('T')[0]}`;

    if (format === "md") {
      content = messages.map(m => `**${m.role === 'user' ? 'You' : 'Assistant'}**:\n\n${m.content}`).join("\n\n---\n\n");
      mime = "text/markdown";
      filename += ".md";
    } else {
      content = JSON.stringify(messages, null, 2);
      mime = "application/json";
      filename += ".json";
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    setIsPending(true);
    try {
      const linkId = await generateSharedLinkAction(conversationId);
      setShareLinkId(linkId);
      setShareUrl(window.location.origin + "/share/" + linkId);
    } catch (e) {
      console.error(e);
      alert("Failed to generate share link");
    } finally {
      setIsPending(false);
    }
  };

  const handleRevoke = async () => {
    if (!shareLinkId) return;
    setIsPending(true);
    try {
      await revokeSharedLinkAction(shareLinkId);
      setShareUrl("");
      setShareLinkId("");
      setShareOpen(false);
    } catch (e) {
      console.error(e);
      alert("Failed to revoke share link");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-background/50 backdrop-blur border border-border/50 shadow-sm" title="Export Chat">
            <Download className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Chat</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-4">
            <Button variant="outline" onClick={() => handleExport("md")}>Export as Markdown</Button>
            <Button variant="outline" onClick={() => handleExport("json")}>Export as JSON</Button>
            <Button variant="outline" onClick={() => {
              const content = messages.map(m =>
                `<div style="margin-bottom:24px;"><strong style="color:${m.role === 'user' ? '#2563eb' : '#16a34a'}">${m.role === 'user' ? 'You' : 'Assistant'}:</strong><div style="white-space:pre-wrap;margin-top:8px;">${m.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div></div>`
              ).join('<hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;">');
              const printWindow = window.open('', '_blank');
              if (printWindow) {
                printWindow.document.write(`
                  <html><head><title>Chat Export</title>
                  <style>body{font-family:system-ui,-apple-system,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.6;color:#1f2937;font-size:14px;}h1{font-size:18px;color:#374151;}hr{border:none;border-top:1px solid #e5e7eb;margin:16px 0;}</style>
                  </head><body><h1>Chat Export — ${new Date().toLocaleDateString()}</h1><hr>${content}</body></html>
                `);
                printWindow.document.close();
                printWindow.print();
              }
            }}>Export as PDF</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-background/50 backdrop-blur border border-border/50 shadow-sm" title="Share Chat">
            <Share className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Chat</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              Create a public, read-only link to share this conversation.
            </p>
            {shareUrl ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input readOnly value={shareUrl} className="flex-1 rounded-md border p-2 text-sm" />
                  <Button onClick={() => navigator.clipboard.writeText(shareUrl)}>Copy</Button>
                </div>
                <Button variant="destructive" size="sm" onClick={handleRevoke} disabled={isPending}>
                  {isPending ? "Revoking..." : "Revoke Link"}
                </Button>
              </div>
            ) : (
              <Button onClick={handleShare} disabled={isPending}>
                {isPending ? "Generating..." : "Generate Link"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

