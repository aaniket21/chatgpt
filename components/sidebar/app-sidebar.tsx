"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { createChatAction, deleteChatAction, renameChatAction, togglePinAction, deleteAllChatsAction } from "@/server/actions/chat-actions";
import {
  Brain,
  Menu,
  Plus,
  MessageSquare,
  Settings,
  Search,
  Pin,
  MoreVertical,
  Pencil,
  Trash2,
  PinOff
} from "lucide-react";
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { useKeyboardShortcuts } from "@/lib/use-keyboard-shortcuts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Conversation {
  id: string;
  title: string | null;
  pinned: boolean;
  updatedAt: Date;
}

interface SidebarProps {
  children: React.ReactNode;
  conversations: Conversation[];
}

function groupConversations(conversations: Conversation[]) {
  const pinned: Conversation[] = [];
  const today: Conversation[] = [];
  const yesterday: Conversation[] = [];
  const previous7Days: Conversation[] = [];
  const previous30Days: Conversation[] = [];
  const older: Conversation[] = [];

  conversations.forEach((conv) => {
    if (conv.pinned) {
      pinned.push(conv);
      return;
    }

    const date = new Date(conv.updatedAt);
    if (isToday(date)) today.push(conv);
    else if (isYesterday(date)) yesterday.push(conv);
    else if (isThisWeek(date)) previous7Days.push(conv);
    else if (isThisMonth(date)) previous30Days.push(conv);
    else older.push(conv);
  });

  return { pinned, today, yesterday, previous7Days, previous30Days, older };
}

function SidebarContent({ conversations }: { conversations: Conversation[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useKeyboardShortcuts({
    onSearch: () => {
      setShowSearch(true);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    },
  });

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(c => (c.title || "").toLowerCase().includes(q));
  }, [conversations, searchQuery]);
  
  const handleNewChat = async () => {
    setIsPending(true);
    try {
      await createChatAction();
    } finally {
      setIsPending(false);
    }
  };

  const handleRename = async (id: string, currentTitle: string | null) => {
    const newTitle = window.prompt("Enter new title:", currentTitle || "New Chat");
    if (newTitle && newTitle !== currentTitle) {
      await renameChatAction(id, newTitle);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this conversation?")) {
      await deleteChatAction(id);
    }
  };

  const handleTogglePin = async (id: string, pinned: boolean) => {
    await togglePinAction(id, !pinned);
  };

  const grouped = useMemo(() => groupConversations(filteredConversations), [filteredConversations]);

  const renderGroup = (title: string, list: Conversation[]) => {
    if (list.length === 0) return null;
    return (
      <div className="mb-4">
        <h3 className="mb-1 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </h3>
        <div className="space-y-1">
          {list.map((conv) => {
            const isActive = pathname === `/c/${conv.id}`;
            return (
              <div key={conv.id} className="relative group flex items-center">
                  <Link 
                    href={`/c/${conv.id}`}
                    className={cn(
                      buttonVariants({ variant: isActive ? "secondary" : "ghost" }),
                      "w-full justify-start h-10 px-3 font-normal pr-8",
                      isActive ? "bg-accent/50" : ""
                    )}
                  >
                    {conv.pinned ? (
                      <Pin className="mr-2 h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <MessageSquare className="mr-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                    )}
                    <span className="truncate">{conv.title || "New Chat"}</span>
                  </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={cn(
                        "absolute right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity",
                        isActive && "opacity-100"
                      )}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleTogglePin(conv.id, conv.pinned)}>
                      {conv.pinned ? <PinOff className="mr-2 h-4 w-4" /> : <Pin className="mr-2 h-4 w-4" />}
                      {conv.pinned ? "Unpin" : "Pin"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRename(conv.id, conv.title)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDelete(conv.id)}
                      className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 p-4 pb-2">
        <Link href="/" className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Brain className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm truncate">LocalMind Chat</span>
        </Link>
      </div>

      <div className="flex gap-2 px-4 py-2">
        <Button
          variant="outline"
          className="flex-1 justify-start gap-2"
          onClick={handleNewChat}
          disabled={isPending}
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          aria-label="Search chats"
          onClick={() => {
            setShowSearch(!showSearch);
            if (!showSearch) setTimeout(() => searchInputRef.current?.focus(), 50);
          }}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {showSearch && (
        <div className="px-4 pb-2">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full rounded-md border bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setShowSearch(false);
                setSearchQuery("");
              }
            }}
          />
        </div>
      )}

      <ScrollArea className="flex-1 px-2">
        <div className="p-2">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-sm text-muted-foreground">
              <MessageSquare className="mb-2 h-8 w-8 opacity-20" />
              <p>No conversations yet</p>
            </div>
          ) : (
            <>
              {renderGroup("Pinned", grouped.pinned)}
              {renderGroup("Today", grouped.today)}
              {renderGroup("Yesterday", grouped.yesterday)}
              {renderGroup("Previous 7 Days", grouped.previous7Days)}
              {renderGroup("Previous 30 Days", grouped.previous30Days)}
              {renderGroup("Older", grouped.older)}
              <div className="pt-2 pb-1 px-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={async () => {
                    if (window.confirm("Are you sure you want to delete ALL conversations? This cannot be undone.")) {
                      await deleteAllChatsAction();
                    }
                  }}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete all conversations
                </Button>
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserMenu />
            <Button variant="ghost" size="icon" asChild aria-label="Settings">
              <Link href="/settings">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

export function AppSidebar({ children, conversations }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden">
      <aside className="hidden md:flex md:w-[280px] md:flex-col md:border-r bg-sidebar">
        <SidebarContent conversations={conversations} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex items-center gap-2 border-b p-2 md:hidden">
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open sidebar">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <div className="flex items-center gap-2 flex-1">
              <Brain className="h-5 w-5 text-primary" />
              <span className="font-semibold text-sm">LocalMind Chat</span>
            </div>
            <ThemeToggle />
            <UserMenu />
          </header>

          <main className="flex-1 overflow-hidden">{children}</main>
        </div>

        <SheetContent side="left" className="w-[280px] p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent conversations={conversations} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
