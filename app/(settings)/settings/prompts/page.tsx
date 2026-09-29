import { db } from "@/db";
import { promptTemplates } from "@/db/schema";
import { auth } from "@/server/auth";
import { eq, asc } from "drizzle-orm";
import { PromptsManager } from "@/components/settings/prompts-manager";

export default async function PromptsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const prompts = await db.query.promptTemplates.findMany({
    where: eq(promptTemplates.userId, session.user.id),
    orderBy: [asc(promptTemplates.createdAt)]
  });

  return (
    <div className="w-full h-full">
      <PromptsManager prompts={prompts} />
    </div>
  );
}
