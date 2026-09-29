import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { decryptKey } from "./crypto";

export function getProviderModel(connection: any) {
  let apiKey = undefined;
  if (connection.encryptedApiKey) {
    try {
      apiKey = decryptKey(connection.encryptedApiKey);
    } catch (e) {
      console.error("Failed to decrypt API key", e);
    }
  }

  const { provider, baseUrl, modelId } = connection;

  if (baseUrl) {
    try {
      const url = new URL(baseUrl);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error("Invalid protocol for AI provider URL");
      }
      if (url.hostname === "169.254.169.254") {
        throw new Error("SSRF Protection: Forbidden hostname");
      }
    } catch (e: any) {
      throw new Error(`Invalid base URL: ${e.message}`);
    }
  }

  if (provider === "openai" || provider === "openai-compatible" || provider === "openrouter" || provider === "lmstudio" || provider === "ollama") {
    const openai = createOpenAI({
      apiKey: apiKey || "not-needed",
      baseURL: baseUrl || undefined,
    });
    return openai(modelId);
  }

  if (provider === "anthropic") {
    const anthropic = createAnthropic({
      apiKey: apiKey || "",
      baseURL: baseUrl || undefined,
    });
    return anthropic(modelId);
  }

  if (provider === "google") {
    const google = createGoogleGenerativeAI({
      apiKey: apiKey || "",
      baseURL: baseUrl || undefined,
    });
    return google(modelId);
  }

  throw new Error(`Unsupported provider: ${provider}`);
}
