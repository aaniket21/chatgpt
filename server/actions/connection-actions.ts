"use server";

import { auth } from "@/server/auth";
import { db } from "@/db";
import { modelConnections } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { encryptKey } from "@/utils/crypto";

export async function saveConnectionAction(data: any, id?: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const { name, provider, baseUrl, apiKey, modelId, mode, temperature, topP, maxTokens, reasoningEffort } = data;

  const params = {
    ...(temperature !== undefined && temperature !== null ? { temperature } : {}),
    ...(topP !== undefined && topP !== null ? { topP } : {}),
    ...(maxTokens !== undefined && maxTokens !== null ? { maxTokens } : {}),
    ...(reasoningEffort ? { reasoningEffort } : {}),
  };

  const encryptedApiKey = apiKey ? encryptKey(apiKey) : null;

  if (id) {
    // Edit
    const existing = await db.query.modelConnections.findFirst({
      where: and(eq(modelConnections.id, id), eq(modelConnections.userId, session.user.id)),
    });

    if (!existing) throw new Error("Connection not found");

    await db.update(modelConnections).set({
      name,
      provider,
      baseUrl: baseUrl || null,
      encryptedApiKey: apiKey ? encryptedApiKey : existing.encryptedApiKey,
      modelId,
      mode,
      params: Object.keys(params).length > 0 ? params : null,
    }).where(eq(modelConnections.id, id));
  } else {
    // Create
    await db.insert(modelConnections).values({
      userId: session.user.id,
      name,
      provider,
      baseUrl: baseUrl || null,
      encryptedApiKey,
      modelId,
      mode,
      params: Object.keys(params).length > 0 ? params : null,
    });
  }

  revalidatePath("/settings/connections");
}

export async function deleteConnectionAction(id: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await db.delete(modelConnections).where(
    and(eq(modelConnections.id, id), eq(modelConnections.userId, session.user.id))
  );

  revalidatePath("/settings/connections");
}

export async function setDefaultConnectionAction(id: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Set all to false first
  await db.update(modelConnections)
    .set({ isDefault: false })
    .where(eq(modelConnections.userId, session.user.id));

  // Set selected to true
  await db.update(modelConnections)
    .set({ isDefault: true })
    .where(and(eq(modelConnections.id, id), eq(modelConnections.userId, session.user.id)));

  revalidatePath("/settings/connections");
}
