"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface UseKeyboardShortcutsOptions {
  onSearch?: () => void;
}

export function useKeyboardShortcuts({ onSearch }: UseKeyboardShortcutsOptions = {}) {
  const router = useRouter();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ctrl+K or Cmd+K: Open search
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      onSearch?.();
    }

    // Ctrl+Shift+O or Cmd+Shift+O: New chat
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "O") {
      e.preventDefault();
      // Navigate to home which creates a new chat context
      router.push("/");
    }
  }, [onSearch, router]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
