import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { auth } from "@/server/auth";
import { db } from "@/db";
import { conversations } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const userConversations = await db.query.conversations.findMany({
    where: eq(conversations.userId, session.user.id),
    orderBy: desc(conversations.updatedAt),
  });

  return <AppSidebar conversations={userConversations}>{children}</AppSidebar>;
}
