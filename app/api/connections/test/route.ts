import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { getProviderModel } from "@/utils/ai-providers";
import { generateText } from "ai";

function isSSRFSafe(urlStr: string) {
  if (!urlStr) return true; // Empty is fine, uses default

  try {
    const url = new URL(urlStr);
    
    // Forbid non-HTTP/S protocols
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;

    // A basic SSRF check for localhost / internal IPs
    // In a real production environment, you need a more robust library like 'is-localhost-ip' or 'ip-range-check'
    // For now, we block obvious localhost access unless it's explicitly allowed in dev (or if the user is running Ollama locally)
    // Wait, if it's "LocalMind Chat", users WANT to connect to localhost for Ollama/LMStudio!
    // So SSRF protection might mean forbidding AWS metadata endpoint (169.254.169.254)
    
    if (url.hostname === "169.254.169.254") return false;
    
    return true;
  } catch (e) {
    return false; // Invalid URL
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { provider, baseUrl, apiKey, modelId } = body;

    if (!isSSRFSafe(baseUrl)) {
      return NextResponse.json({ error: "Invalid or forbidden base URL (SSRF Protection)" }, { status: 400 });
    }

    // Temporarily mock the encryptedApiKey by using plain for testing the connection
    // We pass it directly to getProviderModel since getProviderModel expects the object to have encryptedApiKey
    // We will just patch getProviderModel logic, but getProviderModel decrypts it.
    // Instead, we can just instantiate here for testing.
    
    let testConnection = {
      provider,
      baseUrl,
      modelId,
      // We encode it so getProviderModel's decrypt fails gracefully but we pass apiKey directly?
      // No, getProviderModel expects encryptedApiKey. We'll just construct the model directly for the test.
    };

    // Construct model directly to bypass DB / encryption for the test
    let model;
    if (provider === "openai" || provider === "openai-compatible" || provider === "openrouter" || provider === "lmstudio" || provider === "ollama") {
      const { createOpenAI } = await import("@ai-sdk/openai");
      const openai = createOpenAI({ apiKey: apiKey || "not-needed", baseURL: baseUrl || undefined });
      model = openai(modelId);
    } else if (provider === "anthropic") {
      const { createAnthropic } = await import("@ai-sdk/anthropic");
      const anthropic = createAnthropic({ apiKey: apiKey || "", baseURL: baseUrl || undefined });
      model = anthropic(modelId);
    } else if (provider === "google") {
      const { createGoogleGenerativeAI } = await import("@ai-sdk/google");
      const google = createGoogleGenerativeAI({ apiKey: apiKey || "", baseURL: baseUrl || undefined });
      model = google(modelId);
    } else {
      return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
    }

    // Try a simple generation
    await generateText({
      model: model as any,
      prompt: "Hello",
      maxTokens: 1,
    });

    return NextResponse.json({ success: true, message: "Connection successful" });
  } catch (error: any) {
    console.error("Test connection error:", error);
    return NextResponse.json({ error: error.message || "Failed to connect" }, { status: 500 });
  }
}
