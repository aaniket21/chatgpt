"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ConnectionForm, ConnectionFormValues } from "./connection-form";
import { saveConnectionAction, deleteConnectionAction, setDefaultConnectionAction } from "@/server/actions/connection-actions";
import { Plus, Settings2, Trash2, CheckCircle2, Circle } from "lucide-react";

export function ConnectionsList({ connections }: { connections: any[] }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (data: ConnectionFormValues) => {
    setIsLoading(true);
    try {
      await saveConnectionAction(data, editingId || undefined);
      setIsAddOpen(false);
      setEditingId(null);
    } catch (e) {
      console.error(e);
      alert("Failed to save connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this connection?")) {
      await deleteConnectionAction(id);
    }
  };

  const handleSetDefault = async (id: string) => {
    await setDefaultConnectionAction(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Saved Connections</h2>
        <Dialog open={isAddOpen || !!editingId} onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false);
            setEditingId(null);
          } else {
            setIsAddOpen(true);
          }
        }}>
          {/* @ts-expect-error React 19 types */}
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Connection
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Connection" : "Add Connection"}</DialogTitle>
            </DialogHeader>
            <ConnectionForm 
              initialData={editingId ? connections.find(c => c.id === editingId) : undefined}
              onSubmit={handleSave} 
              isLoading={isLoading} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {connections.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground border rounded-xl border-dashed">
            No connections found. Add one to get started.
          </div>
        ) : (
          connections.map(conn => (
            <Card key={conn.id} className="flex flex-col relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center gap-2 truncate pr-2">
                      {conn.name}
                    </CardTitle>
                    <CardDescription className="uppercase text-xs mt-1 font-semibold tracking-wider">
                      {conn.provider}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 -mr-2 -mt-2 shrink-0 text-muted-foreground"
                    onClick={() => handleSetDefault(conn.id)}
                    title={conn.isDefault ? "Default Connection" : "Set as Default"}
                  >
                    {conn.isDefault ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 opacity-50 hover:opacity-100" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pb-2 flex-1 text-sm text-muted-foreground">
                <div className="truncate">Model: {conn.modelId}</div>
                {conn.baseUrl && <div className="truncate">URL: {conn.baseUrl}</div>}
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-2 border-t mt-auto bg-muted/20">
                <Button variant="ghost" size="sm" onClick={() => setEditingId(conn.id)}>
                  <Settings2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(conn.id)} className="text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
