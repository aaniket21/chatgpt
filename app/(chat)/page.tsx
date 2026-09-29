import { Chat } from "@/components/chat/chat";
import { auth } from "@/server/auth";
import { db } from "@/db";
import { modelConnections } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function HomePage() {
  const session = await auth();
  
  let connections: any[] = [];
  if (session?.user) {
    connections = await db.query.modelConnections.findMany({
      where: eq(modelConnections.userId, session.user.id),
    });
  }

  return (
    <div className="flex-1 h-full relative overflow-hidden">
      <Chat connections={connections} />
    </div>
  );
}
