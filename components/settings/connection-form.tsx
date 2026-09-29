"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const connectionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  provider: z.enum([
    "openai-compatible",
    "openai",
    "anthropic",
    "google",
    "openrouter",
    "ollama",
    "lmstudio"
  ]),
  baseUrl: z.string().optional(),
  apiKey: z.string().optional(),
  modelId: z.string().min(1, "Model ID is required"),
  mode: z.enum(["server", "browser"]).default("server"),
  temperature: z.coerce.number().min(0).max(2).optional(),
  topP: z.coerce.number().min(0).max(1).optional(),
  maxTokens: z.coerce.number().int().min(1).optional(),
  reasoningEffort: z.string().optional(),
});

export type ConnectionFormValues = z.infer<typeof connectionSchema>;

interface ConnectionFormProps {
  initialData?: Partial<ConnectionFormValues>;
  onSubmit: (data: ConnectionFormValues) => void;
  isLoading?: boolean;
}

export function ConnectionForm({ initialData, onSubmit, isLoading }: ConnectionFormProps) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(connectionSchema),
    defaultValues: {
      name: initialData?.name || "",
      provider: initialData?.provider || "openai",
      baseUrl: initialData?.baseUrl || "",
      apiKey: initialData?.apiKey || "",
      modelId: initialData?.modelId || "",
      mode: initialData?.mode || "server",
      temperature: (initialData as any)?.temperature ?? undefined,
      topP: (initialData as any)?.topP ?? undefined,
      maxTokens: (initialData as any)?.maxTokens ?? undefined,
      reasoningEffort: (initialData as any)?.reasoningEffort ?? "",
    },
  });

  const provider = watch("provider");

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean, msg: string} | null>(null);

  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [availableModels, setAvailableModels] = useState<{id: string, name: string}[]>([]);
  const [modelsError, setModelsError] = useState<string | null>(null);

  const handleFetchModels = async () => {
    const data = watch();
    setIsFetchingModels(true);
    setModelsError(null);
    try {
      const res = await fetch("/api/connections/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: data.provider,
          baseUrl: data.baseUrl,
          apiKey: data.apiKey
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setAvailableModels(json.models || []);
        if (json.models?.length > 0) {
          // Keep current model if valid, else pick first
          if (!json.models.find((m: any) => m.id === data.modelId)) {
            setValue("modelId", json.models[0].id);
          }
        }
      } else {
        setModelsError(json.error || "Failed to fetch models");
      }
    } catch (e: any) {
      setModelsError(e.message || "Network error");
    } finally {
      setIsFetchingModels(false);
    }
  };

  const handleTestConnection = async () => {
    const data = watch();
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/connections/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok) {
        setTestResult({ success: true, msg: "Connection successful!" });
      } else {
        setTestResult({ success: false, msg: json.error || "Connection failed" });
      }
    } catch (e: any) {
      setTestResult({ success: false, msg: e.message || "Network error" });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit((d) => onSubmit(d as ConnectionFormValues))} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} placeholder="My OpenAI Connection" />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
            <Select 
              value={provider} 
              onValueChange={(val: any) => setValue("provider", val)}
            >
              <SelectTrigger id="provider">
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="openrouter">OpenRouter</SelectItem>
                <SelectItem value="ollama">Ollama</SelectItem>
                <SelectItem value="lmstudio">LM Studio</SelectItem>
                <SelectItem value="openai-compatible">OpenAI Compatible (Custom)</SelectItem>
              </SelectContent>
            </Select>
            {errors.provider && <p className="text-sm text-destructive">{errors.provider.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseUrl">Base URL (Optional)</Label>
            <Input id="baseUrl" {...register("baseUrl")} placeholder="https://api.openai.com/v1" />
            {errors.baseUrl && <p className="text-sm text-destructive">{errors.baseUrl.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key (Optional for local)</Label>
            <Input id="apiKey" type="password" {...register("apiKey")} placeholder={initialData?.apiKey ? "••••••••" : "sk-..."} />
            {errors.apiKey && <p className="text-sm text-destructive">{errors.apiKey.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="modelId">Default Model ID</Label>
            <div className="flex gap-2">
              {availableModels.length > 0 ? (
                <Select 
                  value={watch("modelId")} 
                  onValueChange={(val: any) => setValue("modelId", val)}
                >
                  <SelectTrigger id="modelId" className="flex-1">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input id="modelId" className="flex-1" {...register("modelId")} placeholder="gpt-4o-mini" />
              )}
              <Button type="button" variant="outline" onClick={handleFetchModels} disabled={isFetchingModels || isLoading}>
                {isFetchingModels ? "Fetching..." : "Fetch Models"}
              </Button>
            </div>
            {modelsError && <p className="text-sm text-destructive">{modelsError}</p>}
            {errors.modelId && <p className="text-sm text-destructive">{errors.modelId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mode">Execution Mode</Label>
            <Select 
              value={watch("mode")} 
              onValueChange={(val: any) => setValue("mode", val)}
            >
              <SelectTrigger id="mode">
                <SelectValue placeholder="Select execution mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="server">Server Mode</SelectItem>
                <SelectItem value="browser">Browser Mode (WebLLM - Client Side)</SelectItem>
              </SelectContent>
            </Select>
            {errors.mode && <p className="text-sm text-destructive">{errors.mode.message}</p>}
          </div>

          <div className="border-t pt-4 mt-2">
            <p className="text-xs font-medium text-muted-foreground mb-3">Default Model Parameters (Optional)</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature</Label>
                <Input id="temperature" type="number" step="0.1" min="0" max="2" {...register("temperature")} placeholder="0.7" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="topP">Top P</Label>
                <Input id="topP" type="number" step="0.05" min="0" max="1" {...register("topP")} placeholder="1.0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxTokens">Max Tokens</Label>
                <Input id="maxTokens" type="number" min="1" {...register("maxTokens")} placeholder="4096" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reasoningEffort">Reasoning Effort</Label>
                <Input id="reasoningEffort" {...register("reasoningEffort")} placeholder="low / medium / high" />
              </div>
            </div>
          </div>

          {testResult && (
            <div className={`p-2 text-sm rounded border ${testResult.success ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400' : 'bg-destructive/10 border-destructive/20 text-destructive'}`}>
              {testResult.msg}
            </div>
          )}

          <div className="pt-4 flex justify-between items-center">
            <Button type="button" variant="outline" onClick={handleTestConnection} disabled={isTesting || isLoading}>
              {isTesting ? "Testing..." : "Test Connection"}
            </Button>
            <Button type="submit" disabled={isLoading || isTesting}>
              {isLoading ? "Saving..." : "Save Connection"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
