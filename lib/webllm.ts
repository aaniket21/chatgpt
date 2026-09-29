import { CreateWebWorkerMLCEngine, WebWorkerMLCEngine } from "@mlc-ai/web-llm";

let engine: WebWorkerMLCEngine | null = null;
let currentModel: string | null = null;

export async function getWebLLMEngine(modelId: string, initProgressCallback?: (progress: number, text: string) => void) {
  if (engine && currentModel === modelId) {
    return engine;
  }

  if (!engine) {
    // We use a custom worker to prevent blocking the main thread
    engine = await CreateWebWorkerMLCEngine(
      new Worker(new URL("./webllm-worker.ts", import.meta.url), { type: "module" }),
      modelId,
      {
        initProgressCallback: (progress: any) => {
          if (initProgressCallback) {
            initProgressCallback(progress.progress, progress.text);
          }
        },
      }
    );
  } else {
    // Engine exists, but different model, so we reload
    engine.setInitProgressCallback((progress: any) => {
      if (initProgressCallback) {
        initProgressCallback(progress.progress, progress.text);
      }
    });
    await engine.reload(modelId);
  }

  currentModel = modelId;
  return engine;
}
