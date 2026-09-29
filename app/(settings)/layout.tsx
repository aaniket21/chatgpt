import Link from "next/link";
import { Brain, ArrowLeft } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur sm:px-6">
        <Link href="/" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back to Chat</span>
        </Link>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <span className="font-semibold">LocalMind Settings</span>
        </div>
      </header>
      <div className="flex flex-1 flex-col sm:flex-row mx-auto w-full max-w-6xl">
        <aside className="w-full sm:w-64 border-r p-4 hidden sm:block">
          <nav className="flex flex-col gap-1">
            <Button variant="secondary" className="justify-start w-full" asChild>
              <Link href="/settings/connections">Model Connections</Link>
            </Button>
            <Button variant="ghost" className="justify-start w-full" asChild>
              <Link href="/settings/general">General Settings</Link>
            </Button>
            <Button variant="ghost" className="justify-start w-full" asChild>
              <Link href="/settings/prompts">Prompt Templates</Link>
            </Button>
          </nav>
        </aside>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
