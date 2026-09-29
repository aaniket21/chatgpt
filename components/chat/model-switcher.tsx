"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateChatConnectionAction } from "@/server/actions/chat-actions";
import { Loader2 } from "lucide-react";

interface ModelSwitcherProps {
  conversationId: string;
  currentConnectionId?: string;
  connections: { id: string; name: string; provider: string; isDefault: boolean }[];
}

export function ModelSwitcher({ conversationId, currentConnectionId, connections }: ModelSwitcherProps) {
  const [isPending, setIsPending] = useState(false);

  // If no current connection, we find the default one to display as selected
  const defaultConnection = connections.find(c => c.isDefault);
  const value = currentConnectionId || defaultConnection?.id || "";

  const handleChange = async (newId: string | null) => {
    if (!newId) return;
    setIsPending(true);
    try {
      await updateChatConnectionAction(conversationId, newId);
    } catch (e) {
      console.error(e);
      alert("Failed to update chat connection");
    } finally {
      setIsPending(false);
    }
  };

  if (connections.length === 0) {
    return <div className="text-xs text-muted-foreground">No connections available</div>;
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={handleChange} disabled={isPending}>
        <SelectTrigger className="w-[200px] h-8 text-xs bg-background/50 backdrop-blur border-border/50">
          <SelectValue placeholder="Select a model..." />
        </SelectTrigger>
        <SelectContent>
          {connections.map((conn) => (
            <SelectItem key={conn.id} value={conn.id}>
              {conn.name} ({conn.provider})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
    </div>
  );
}
