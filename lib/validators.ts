import { z } from "zod";

export const signupSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  email: z.string().email("Please enter a valid email").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email").trim().toLowerCase(),
});

export const conversationSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  systemPrompt: z.string().max(10000).optional(),
  modelConnectionId: z.string().uuid().optional(),
  pinned: z.boolean().optional(),
});

export const messageSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().min(1, "Message cannot be empty").max(100000),
  parentId: z.string().uuid().optional(),
  attachments: z
    .array(
      z.object({
        type: z.enum(["image", "file"]),
        name: z.string(),
        url: z.string(),
        mimeType: z.string(),
        size: z.number(),
      })
    )
    .optional(),
});

export const modelConnectionSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  provider: z.enum([
    "openai-compatible",
    "openai",
    "anthropic",
    "google",
    "openrouter",
    "ollama",
    "lmstudio",
  ]),
  baseUrl: z.string().url().optional().or(z.literal("")),
  apiKey: z.string().optional(),
  modelId: z.string().min(1, "Model ID is required"),
  params: z
    .object({
      temperature: z.number().min(0).max(2).optional(),
      topP: z.number().min(0).max(1).optional(),
      maxTokens: z.number().min(1).max(1000000).optional(),
      reasoningEffort: z.string().optional(),
    })
    .optional(),
  mode: z.enum(["server", "browser"]).default("server"),
  isDefault: z.boolean().default(false),
});

export const chatRequestSchema = z.object({
  conversationId: z.string().uuid(),
  message: z.string().min(1).max(100000),
  modelConnectionId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
  attachments: z
    .array(
      z.object({
        type: z.enum(["image", "file"]),
        name: z.string(),
        url: z.string().url(),
        mimeType: z.string(),
        size: z.number(),
        content: z.string().optional(),
      })
    )
    .optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ModelConnectionInput = z.infer<typeof modelConnectionSchema>;
export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
