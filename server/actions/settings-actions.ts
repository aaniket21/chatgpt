"use server";

import { db } from "@/db";
import { userSettings } from "@/db/schema";
import { auth } from "@/server/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateGeneralSettingsAction(customInstructionsAbout: string, customInstructionsStyle: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const existing = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, session.user.id)
  });

  if (existing) {
    await db.update(userSettings)
      .set({ customInstructionsAbout, customInstructionsStyle, updatedAt: new Date() })
      .where(eq(userSettings.userId, session.user.id));
  } else {
    await db.insert(userSettings).values({
      userId: session.user.id,
      customInstructionsAbout,
      customInstructionsStyle,
    });
  }

  revalidatePath("/settings/general");
}
