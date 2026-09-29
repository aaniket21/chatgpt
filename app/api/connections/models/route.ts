import { NextResponse } from "next/server";
import { auth } from "@/server/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { provider, baseUrl, apiKey } = await req.json();

    let modelsUrl = "";
    const headers: Record<string, string> = {};

    if (provider === "openai" || provider === "openai-compatible" || provider === "openrouter") {
      modelsUrl = (baseUrl || "https://api.openai.com") + "/v1/models";
      if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
    } else if (provider === "anthropic") {
      modelsUrl = (baseUrl || "https://api.anthropic.com") + "/v1/models";
      if (apiKey) {
        headers["x-api-key"] = apiKey;
        headers["anthropic-version"] = "2023-06-01";
      }
    } else if (provider === "google") {
      modelsUrl = (baseUrl || "https://generativelanguage.googleapis.com") + `/v1beta/models?key=${apiKey || ""}`;
    } else if (provider === "ollama") {
      modelsUrl = (baseUrl || "http://localhost:11434") + "/api/tags";
    } else if (provider === "lmstudio") {
      modelsUrl = (baseUrl || "http://localhost:1234") + "/v1/models";
    } else {
      return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
    }

    const res = await fetch(modelsUrl, {
      headers,
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "Unknown error");
      return NextResponse.json({ error: `Failed to fetch models: ${res.status} ${text.slice(0, 200)}` }, { status: 502 });
    }

    const data = await res.json();

    let models: { id: string; name: string }[] = [];

    if (provider === "ollama") {
      // Ollama returns { models: [{ name, ... }] }
      models = (data.models || []).map((m: any) => ({ id: m.name, name: m.name }));
    } else if (provider === "google") {
      // Google returns { models: [{ name: "models/gemini-...", displayName: "..." }] }
      models = (data.models || []).map((m: any) => ({
        id: m.name?.replace("models/", "") || m.name,
        name: m.displayName || m.name,
      }));
    } else {
      // OpenAI-compatible format: { data: [{ id, ... }] }
      models = (data.data || []).map((m: any) => ({ id: m.id, name: m.id }));
    }

    // Sort alphabetically
    models.sort((a, b) => a.id.localeCompare(b.id));

    return NextResponse.json({ models });
  } catch (error: any) {
    console.error("Fetch models error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch models" }, { status: 500 });
  }
}
