import { db } from "@/db";
import { conversations, messages, sharedLinks } from "@/db/schema";
import { eq, asc, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ChatMessage } from "@/components/chat/chat-message";

export default async function SharePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  // First try: look up as a shared_links ID
  const sharedLink = await db.query.sharedLinks.findFirst({
    where: and(eq(sharedLinks.id, params.id), eq(sharedLinks.active, true)),
  });

  let conversationId: string;

  if (sharedLink) {
    conversationId = sharedLink.conversationId;
  } else {
    // Fallback: treat the ID as a direct conversation ID (backwards compat)
    conversationId = params.id;
  }

  const conversation = await db.query.conversations.findFirst({
    where: eq(conversations.id, conversationId),
    with: {
      user: true,
    },
  });

  if (!conversation || !conversation.isShared) {
    notFound();
  }

  const dbMessages = await db.query.messages.findMany({
    where: eq(messages.conversationId, conversationId),
    orderBy: [asc(messages.createdAt)],
  });

  const formattedMessages = dbMessages.map((msg) => ({
    id: msg.id,
    role: msg.role as "user" | "assistant" | "system" | "data",
    content: msg.reasoning ? `<think>\n${msg.reasoning}\n</think>\n\n${msg.content}` : msg.content,
  }));

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center max-w-4xl mx-auto">
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold">{conversation.title}</h1>
            <p className="text-xs text-muted-foreground">
              Shared by {conversation.user?.name || "Anonymous"} on {new Date(conversation.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full max-w-4xl mx-auto py-8">
        <div className="flex flex-col gap-4">
          {formattedMessages.filter(m => m.role !== 'system').map(m => (
            <ChatMessage key={m.id} message={m} />
          ))}
        </div>
      </main>
    </div>
  );
}

