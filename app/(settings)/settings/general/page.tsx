import { db } from "@/db";
import { userSettings } from "@/db/schema";
import { auth } from "@/server/auth";
import { eq } from "drizzle-orm";
import { GeneralSettingsForm } from "@/components/settings/general-settings-form";

export default async function GeneralSettingsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, session.user.id)
  });

  return (
    <div className="w-full">
      <GeneralSettingsForm initialSettings={settings || null} />
    </div>
  );
}
