import { db } from "./db";
import { conversations } from "./db/schema";
import { eq, desc } from "drizzle-orm";

async function main() {
  try {
    const res = await db.query.conversations.findMany({
      where: eq(conversations.userId, "8d21c09b-89f7-4932-b66a-91d45c8cc14f"),
      orderBy: desc(conversations.updatedAt),
    });
    console.log("Success", res);
  } catch (e: any) {
    console.error("Error executing query:");
    console.error(e);
  }
  process.exit(0);
}
main();
