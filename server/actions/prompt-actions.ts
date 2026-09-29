"use server";

import { db } from "@/db";
import { promptTemplates } from "@/db/schema";
import { auth } from "@/server/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createPromptTemplateAction(name: string, content: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.insert(promptTemplates).values({
    userId: session.user.id,
    name,
    content,
  });

  revalidatePath("/settings/prompts");
}

export async function updatePromptTemplateAction(id: string, name: string, content: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.update(promptTemplates)
    .set({ name, content, updatedAt: new Date() })
    .where(and(eq(promptTemplates.id, id), eq(promptTemplates.userId, session.user.id)));

  revalidatePath("/settings/prompts");
}

export async function deletePromptTemplateAction(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.delete(promptTemplates)
    .where(and(eq(promptTemplates.id, id), eq(promptTemplates.userId, session.user.id)));

  revalidatePath("/settings/prompts");
}
