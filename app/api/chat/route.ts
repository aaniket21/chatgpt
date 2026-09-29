import { openai } from "@ai-sdk/openai";
import { streamText, generateText } from "ai";
import { auth } from "@/server/auth";
import { db } from "@/db";
import { messages, conversations, modelConnections, userSettings } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getProviderModel } from "@/utils/ai-providers";
import { chatRateLimiter } from "@/lib/rate-limit";

export const maxDuration = 30;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > 5 * 1024 * 1024) { // 5MB limit
    return new Response("Payload Too Large", { status: 413 });
  }

  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const rateLimit = chatRateLimiter.check(`${session.user.id}-${ip}`);
  
  if (!rateLimit.success) {
    return new Response("Too many requests", { 
      status: 429,
      headers: {
        "X-RateLimit-Limit": "50",
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": rateLimit.reset.toString(),
        "Retry-After": Math.ceil((rateLimit.reset - Date.now()) / 1000).toString(),
      }
    });
  }

  const { messages: clientMessages, id: conversationId } = await req.json();

  const latestMessage = clientMessages[clientMessages.length - 1];

  // If there's a conversation ID, save the user message immediately
  let conversation = null;
  let connection = null;

  if (conversationId) {
    conversation = await db.query.conversations.findFirst({
      where: eq(conversations.id, conversationId),
    });

    if (conversation && conversation.userId === session.user.id) {
      await db.insert(messages).values({
        conversationId,
        role: "user",
        content: latestMessage.content,
      });

      // Fetch connection
      if (conversation.modelConnectionId) {
        connection = await db.query.modelConnections.findFirst({
          where: eq(modelConnections.id, conversation.modelConnectionId),
        });
      }

      // Auto-generate title
      if (clientMessages.length === 1 && conversation.title === "New Chat") {
        (async () => {
          try {
            const defaultConn = await db.query.modelConnections.findFirst({
              where: and(eq(modelConnections.userId, session.user.id), eq(modelConnections.isDefault, true)),
            });
            const titleModel = defaultConn ? getProviderModel(defaultConn) : openai("gpt-4o-mini");
            
            const { text } = await generateText({
              model: titleModel as any,
              prompt: `Generate a short (max 4-5 words) title for this conversation based on the first message: "${latestMessage.content}". Return ONLY the title text, no quotes or prefix.`,
            });
            await db.update(conversations)
              .set({ title: text.trim() })
              .where(eq(conversations.id, conversationId));
          } catch (error) {
            console.error("Failed to generate title:", error);
          }
        })();
      }
    }
  }

  // Fallback to default connection if none assigned to chat
  if (!connection) {
    connection = await db.query.modelConnections.findFirst({
      where: and(eq(modelConnections.userId, session.user.id), eq(modelConnections.isDefault, true)),
    });
  }

  if (!connection) {
    return new Response("No model connection found. Please configure one in Settings.", { status: 400 });
  }

  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, session.user.id)
  });

  let finalSystemPrompt = "";

  if (settings?.customInstructionsAbout) {
    finalSystemPrompt += `About the user:\n${settings.customInstructionsAbout}\n\n`;
  }
  if (settings?.customInstructionsStyle) {
    finalSystemPrompt += `How to respond:\n${settings.customInstructionsStyle}\n\n`;
  }
  
  if (conversation?.systemPrompt) {
    finalSystemPrompt += conversation.systemPrompt;
  }

  if (finalSystemPrompt) {
    // Only prepend if not already present
    if (clientMessages.length === 0 || clientMessages[0].role !== "system") {
      clientMessages.unshift({ role: "system", content: finalSystemPrompt.trim() });
    }
  }

  const model = getProviderModel(connection);

  const result = await streamText({
    model: model as any,
    messages: clientMessages,
    async onFinish({ text, usage }) {
      if (conversationId) {
        let finalContent = text;
        let reasoning: string | null = null;
        
        // Extract <think> tags for reasoning (DeepSeek/Ollama pattern)
        const thinkMatch = text.match(/<think>([\s\S]*?)<\/think>/);
        if (thinkMatch) {
          reasoning = thinkMatch[1].trim();
          finalContent = text.replace(/<think>[\s\S]*?<\/think>/, "").trim();
        }

        // Save the assistant message when streaming finishes
        await db.insert(messages).values({
          conversationId,
          role: "assistant",
          content: finalContent,
          reasoning,
          tokens: usage.totalTokens,
        });
      }
    },
  });

  return result.toDataStreamResponse();
}
