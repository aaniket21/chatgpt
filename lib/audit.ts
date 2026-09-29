import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { auth } from "@/server/auth";

export async function logAudit(action: string, details?: any) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return;

    await db.insert(auditLogs).values({
      userId,
      action,
      details: details ? JSON.stringify(details) : null,
    });
  } catch (error) {
    console.error("Failed to insert audit log", error);
  }
}
