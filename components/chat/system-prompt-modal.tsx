"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Settings2 } from "lucide-react";
import { updateSystemPromptAction } from "@/server/actions/chat-actions";

interface SystemPromptModalProps {
  conversationId: string;
  initialPrompt?: string;
}

export function SystemPromptModal({ conversationId, initialPrompt = "" }: SystemPromptModalProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isPending, setIsPending] = useState(false);

  const handleSave = async () => {
    setIsPending(true);
    try {
      await updateSystemPromptAction(conversationId, prompt);
      setOpen(false);
    } catch (e) {
      console.error(e);
      alert("Failed to update system prompt");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* @ts-expect-error React 19 types */}
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-background/50 backdrop-blur border border-border/50 shadow-sm" title="System Prompt">
          <Settings2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>System Prompt</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Textarea 
            value={prompt} 
            onChange={e => setPrompt(e.target.value)} 
            placeholder="You are a helpful assistant..."
            className="min-h-[150px]"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
