import { notFound, redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { db } from "@/db";
import { conversations, messages, modelConnections, userSettings } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { Chat } from "@/components/chat/chat";

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  
  const { id } = await params;

  if (!id || id === "undefined") {
    redirect("/");
  }

  const conversation = await db.query.conversations.findFirst({
    where: and(eq(conversations.id, id), eq(conversations.userId, session.user.id)),
  });

  if (!conversation) {
    notFound();
  }

  const dbMessages = await db.query.messages.findMany({
    where: eq(messages.conversationId, id),
    orderBy: asc(messages.createdAt),
  });

  const formattedMessages = dbMessages.map((msg) => ({
    id: msg.id,
    role: msg.role as "user" | "assistant" | "system" | "data",
    content: msg.reasoning ? `<think>\n${msg.reasoning}\n</think>\n\n${msg.content}` : msg.content,
  }));

  const connections = await db.query.modelConnections.findMany({
    where: eq(modelConnections.userId, session.user.id),
  });

  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, session.user.id)
  });

  let finalSystemPrompt = "";

  if (settings?.customInstructionsAbout) {
    finalSystemPrompt += `About the user:\n${settings.customInstructionsAbout}\n\n`;
  }
  if (settings?.customInstructionsStyle) {
    finalSystemPrompt += `How to respond:\n${settings.customInstructionsStyle}\n\n`;
  }
  
  if (conversation?.systemPrompt) {
    finalSystemPrompt += conversation.systemPrompt;
  }

  return (
    <div className="flex-1 h-full relative overflow-hidden">
      <Chat 
        id={id} 
        initialMessages={formattedMessages} 
        currentConnectionId={conversation.modelConnectionId || undefined}
        connections={connections}
        systemPrompt={finalSystemPrompt.trim()}
      />
    </div>
  );
}
