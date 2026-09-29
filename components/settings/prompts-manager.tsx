"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createPromptTemplateAction, updatePromptTemplateAction, deletePromptTemplateAction } from "@/server/actions/prompt-actions";
import { Edit2, Trash2, Plus } from "lucide-react";

interface PromptTemplate {
  id: string;
  name: string;
  content: string;
}

interface PromptsManagerProps {
  prompts: PromptTemplate[];
}

export function PromptsManager({ prompts }: PromptsManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);
  
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [isPending, setIsPending] = useState(false);

  const startEdit = (p: PromptTemplate) => {
    setEditingId(p.id);
    setName(p.name);
    setContent(p.content);
    setIsNew(false);
  };

  const startNew = () => {
    setEditingId(null);
    setName("");
    setContent("");
    setIsNew(true);
  };

  const cancel = () => {
    setEditingId(null);
    setIsNew(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      if (isNew) {
        await createPromptTemplateAction(name, content);
      } else if (editingId) {
        await updatePromptTemplateAction(editingId, name, content);
      }
      cancel();
    } catch (err) {
      console.error(err);
      alert("Failed to save prompt.");
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      await deletePromptTemplateAction(id);
    } catch (err) {
      console.error(err);
      alert("Failed to delete prompt.");
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Prompt Templates</h2>
          <p className="text-muted-foreground">Manage reusable prompt templates for your chats.</p>
        </div>
        {!isNew && !editingId && (
          <Button onClick={startNew} className="gap-2">
            <Plus className="h-4 w-4" />
            New Template
          </Button>
        )}
      </div>

      {(isNew || editingId) && (
        <form onSubmit={handleSave} className="space-y-4 border rounded-xl p-6 bg-muted/20">
          <h3 className="font-semibold text-lg">{isNew ? "Create Template" : "Edit Template"}</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Code Reviewer"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Prompt Content</label>
            <Textarea 
              required
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="You are an expert code reviewer..."
              className="min-h-[150px]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={cancel}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Template"}
            </Button>
          </div>
        </form>
      )}

      {!isNew && !editingId && prompts.length === 0 && (
        <div className="text-center py-12 border rounded-xl bg-muted/10 border-dashed">
          <p className="text-muted-foreground mb-4">No prompt templates created yet.</p>
          <Button variant="outline" onClick={startNew}>Create your first template</Button>
        </div>
      )}

      {!isNew && !editingId && prompts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prompts.map(p => (
            <div key={p.id} className="border rounded-xl p-4 flex flex-col hover:bg-muted/30 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold">{p.name}</h3>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(p)}>
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">{p.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
