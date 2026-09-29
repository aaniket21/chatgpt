"use client";

import { useState, useRef, KeyboardEvent } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/components/ui/button";
import { SendHorizontal, Paperclip, X, Image as ImageIcon, FileText } from "lucide-react";

interface ChatInputProps {
  onSubmit: (message: string, files?: File[]) => void;
  isLoading: boolean;
}

export function ChatInput({ onSubmit, isLoading }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = value.trim();
    if ((!trimmed && attachments.length === 0) || isLoading) return;

    onSubmit(trimmed, attachments.length > 0 ? attachments : undefined);
    setValue("");
    setAttachments([]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (e.clipboardData.files.length > 0) {
      e.preventDefault();
      const newFiles = Array.from(e.clipboardData.files);
      setAttachments((prev) => [...prev, ...newFiles]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...newFiles]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="relative flex w-full max-w-4xl mx-auto flex-col px-4 pb-4 sm:px-6 space-y-2">
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 px-1">
          {attachments.map((file, i) => (
            <div key={i} className="relative flex items-center gap-2 bg-background border rounded-lg p-2 text-xs w-32 shadow-sm">
              <div className="shrink-0 flex h-8 w-8 items-center justify-center bg-muted rounded">
                {file.type.startsWith("image/") ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
              </div>
              <span className="truncate flex-1 font-medium">{file.name}</span>
              <button
                type="button"
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 hover:bg-destructive/90"
                onClick={() => removeAttachment(i)}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="relative flex w-full items-end overflow-hidden rounded-2xl border bg-background px-3 py-3 shadow-sm focus-within:ring-1 focus-within:ring-primary"
      >
        <div className="shrink-0 mr-2 flex items-center">
          <input 
            type="file" 
            multiple 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            accept="image/*,.pdf,.txt,.md,.csv" 
          />
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        </div>

        <TextareaAutosize
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Type a message..."
          maxRows={7}
          minRows={1}
          className="flex-1 max-h-[300px] min-h-[24px] resize-none bg-transparent px-2 py-[2px] text-base placeholder:text-muted-foreground focus:outline-none"
        />
        
        <div className="flex shrink-0 items-center gap-2 pl-2">
          <Button
            type="submit"
            size="icon"
            disabled={(!value.trim() && attachments.length === 0) || isLoading}
            className="h-9 w-9 shrink-0 rounded-full transition-opacity disabled:opacity-50"
            aria-label="Send message"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="absolute right-4 bottom-2 text-[10px] text-muted-foreground/60 select-none">
          ~{Math.round(value.length / 4)} tokens
        </div>
      </form>
    </div>
  );
}
