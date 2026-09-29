import { pgTable, text, timestamp, boolean, jsonb, integer, uuid, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================================
// Users
// ============================================================================
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  hashedPassword: text("hashed_password"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// ============================================================================
// Auth.js required tables
// ============================================================================
export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
  ]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.identifier, table.token] }),
  ]
);

// ============================================================================
// Conversations
// ============================================================================
export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").default("New Chat"),
  pinned: boolean("pinned").default(false).notNull(),
  modelConnectionId: uuid("model_connection_id"),
  systemPrompt: text("system_prompt"),
  isShared: boolean("is_shared").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// ============================================================================
// Messages
// ============================================================================
export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["user", "assistant", "system"] }).notNull(),
  content: text("content").notNull(),
  reasoning: text("reasoning"),
  attachments: jsonb("attachments").$type<Array<{
    type: "image" | "file";
    name: string;
    url: string;
    mimeType: string;
    size: number;
  }>>(),
  parentId: uuid("parent_id"),
  model: text("model"),
  tokens: integer("tokens"),
  feedback: text("feedback", { enum: ["up", "down"] }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ============================================================================
// Model Connections
// ============================================================================
export const modelConnections = pgTable("model_connections", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  provider: text("provider", {
    enum: [
      "openai-compatible",
      "openai",
      "anthropic",
      "google",
      "openrouter",
      "ollama",
      "lmstudio",
    ],
  }).notNull(),
  baseUrl: text("base_url"),
  encryptedApiKey: text("encrypted_api_key"),
  iv: text("iv"),
  modelId: text("model_id").notNull(),
  params: jsonb("params").$type<{
    temperature?: number;
    topP?: number;
    maxTokens?: number;
    reasoningEffort?: string;
  }>(),
  mode: text("mode", { enum: ["server", "browser"] }).default("server").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// ============================================================================
// User Settings
// ============================================================================
export const userSettings = pgTable("user_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  customInstructionsAbout: text("custom_instructions_about"),
  customInstructionsStyle: text("custom_instructions_style"),
  memoryEnabled: boolean("memory_enabled").default(true).notNull(),
  contextWindowSize: integer("context_window_size").default(128000),
  theme: text("theme", { enum: ["light", "dark", "system"] }).default("system"),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// ============================================================================
// Memories
// ============================================================================
export const memories = pgTable("memories", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ============================================================================
// Shared Links
// ============================================================================
export const sharedLinks = pgTable("shared_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ============================================================================
// Prompt Templates
// ============================================================================
export const promptTemplates = pgTable("prompt_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// ============================================================================
// Audit Log
// ============================================================================
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const conversationsRelations = relations(conversations, ({ many, one }) => ({
  messages: many(messages),
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));
