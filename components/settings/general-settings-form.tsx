"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateGeneralSettingsAction } from "@/server/actions/settings-actions";

interface GeneralSettingsFormProps {
  initialSettings: {
    customInstructionsAbout: string | null;
    customInstructionsStyle: string | null;
  } | null;
}

export function GeneralSettingsForm({ initialSettings }: GeneralSettingsFormProps) {
  const [about, setAbout] = useState(initialSettings?.customInstructionsAbout || "");
  const [style, setStyle] = useState(initialSettings?.customInstructionsStyle || "");
  const [isPending, setIsPending] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      await updateGeneralSettingsAction(about, style);
      alert("Settings saved successfully.");
    } catch (e) {
      console.error(e);
      alert("Failed to save settings.");
    } finally {
      setIsPending(false);
    }
  };

  const handleExport = () => {
    const data = JSON.stringify({
      customInstructionsAbout: about,
      customInstructionsStyle: style,
    }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "localmind-settings.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.customInstructionsAbout !== undefined) setAbout(json.customInstructionsAbout);
        if (json.customInstructionsStyle !== undefined) setStyle(json.customInstructionsStyle);
      } catch (err) {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">General Settings</h2>
        <p className="text-muted-foreground">Manage your custom instructions and preferences.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">What would you like LocalMind to know about you to provide better responses?</label>
            <Textarea 
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="e.g. I work as a software engineer..."
              className="min-h-[120px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">How would you like LocalMind to respond?</label>
            <Textarea 
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="e.g. Be concise and professional..."
              className="min-h-[120px]"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 border-t pt-6">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Settings"}
          </Button>

          <div className="ml-auto flex items-center gap-2">
            <Button type="button" variant="outline" onClick={handleExport}>
              Export
            </Button>
            <div className="relative">
              <input 
                type="file" 
                accept=".json" 
                onChange={handleImport} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="Import settings"
              />
              <Button type="button" variant="outline" className="pointer-events-none">
                Import
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
