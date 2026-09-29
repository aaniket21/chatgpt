"use server";

import { auth } from "@/server/auth";
import { db } from "@/db";
import { conversations, messages, sharedLinks } from "@/db/schema";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";

export async function createChatAction() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const [chat] = await db
    .insert(conversations)
    .values({
      userId: session.user.id,
      title: "New Chat",
    })
    .returning({ id: conversations.id });

  revalidatePath("/");
  redirect(`/c/${chat.id}`);
}

export async function deleteChatAction(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.delete(conversations)
    .where(and(eq(conversations.id, id), eq(conversations.userId, session.user.id)));
  
  revalidatePath("/");
  redirect("/");
}

export async function renameChatAction(id: string, title: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.update(conversations)
    .set({ title })
    .where(and(eq(conversations.id, id), eq(conversations.userId, session.user.id)));
  
  revalidatePath("/");
}

export async function togglePinAction(id: string, pinned: boolean) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.update(conversations)
    .set({ pinned })
    .where(and(eq(conversations.id, id), eq(conversations.userId, session.user.id)));
  
  revalidatePath("/");
}

export async function updateChatConnectionAction(conversationId: string, modelConnectionId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.update(conversations)
    .set({ modelConnectionId })
    .where(and(eq(conversations.id, conversationId), eq(conversations.userId, session.user.id)));
  
  revalidatePath(`/c/${conversationId}`);
}

export async function updateSystemPromptAction(id: string, systemPrompt: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.update(conversations)
    .set({ systemPrompt })
    .where(and(eq(conversations.id, id), eq(conversations.userId, session.user.id)));
  
  revalidatePath(`/c/${id}`);
}

export async function saveBrowserMessageAction(conversationId: string, role: string, content: string, reasoning: string | null = null, tokens: number = 0) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const conversation = await db.query.conversations.findFirst({
    where: and(eq(conversations.id, conversationId), eq(conversations.userId, session.user.id)),
  });

  if (!conversation) throw new Error("Conversation not found");

  await db.insert(messages).values({
    conversationId,
    role: role as "user" | "assistant" | "system",
    content,
    reasoning,
    tokens,
  });
}

export async function submitFeedbackAction(messageId: string, feedback: "up" | "down" | null) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Verify ownership via conversation
  const message = await db.query.messages.findFirst({
    where: eq(messages.id, messageId),
    with: {
      conversation: true
    }
  });

  if (!message || message.conversation.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await db.update(messages)
    .set({ feedback })
    .where(eq(messages.id, messageId));
}

export async function generateSharedLinkAction(conversationId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const conversation = await db.query.conversations.findFirst({
    where: eq(conversations.id, conversationId)
  });

  if (!conversation || conversation.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  // Mark conversation as shared
  await db.update(conversations)
    .set({ isShared: true })
    .where(eq(conversations.id, conversationId));

  // Create a shared_links record
  const [link] = await db.insert(sharedLinks)
    .values({
      conversationId,
      userId: session.user.id,
      active: true,
    })
    .returning({ id: sharedLinks.id });

  return link.id;
}

export async function revokeSharedLinkAction(linkId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Deactivate the link
  await db.update(sharedLinks)
    .set({ active: false })
    .where(and(eq(sharedLinks.id, linkId), eq(sharedLinks.userId, session.user.id)));

  // Also check if there are any remaining active links for the conversation
  const link = await db.query.sharedLinks.findFirst({
    where: eq(sharedLinks.id, linkId),
  });

  if (link) {
    const activeLinks = await db.query.sharedLinks.findMany({
      where: and(eq(sharedLinks.conversationId, link.conversationId), eq(sharedLinks.active, true)),
    });

    // If no active links remain, unshare the conversation
    if (activeLinks.length === 0) {
      await db.update(conversations)
        .set({ isShared: false })
        .where(eq(conversations.id, link.conversationId));
    }
  }

  revalidatePath("/");
}

export async function deleteAllChatsAction() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.delete(conversations)
    .where(eq(conversations.userId, session.user.id));

  revalidatePath("/");
  redirect("/");
}
