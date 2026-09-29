import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { db } from "@/db";
import { modelConnections } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ConnectionsList } from "@/components/settings/connections-list";

export default async function ConnectionsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const connections = await db.query.modelConnections.findMany({
    where: eq(modelConnections.userId, session.user.id),
    orderBy: (connections, { desc }) => [desc(connections.createdAt)],
  });

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Model Connections</h1>
        <p className="text-muted-foreground">
          Manage your AI model providers and connections.
        </p>
      </div>
      <ConnectionsList connections={connections} />
    </div>
  );
}
