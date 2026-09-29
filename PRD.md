# LocalMind Chat — Product Requirements Document

## Overview
A production-ready, ChatGPT-style web application where users bring their own AI model connections (OpenAI, Anthropic, Gemini, Ollama, LM Studio, etc.) and chat with streaming responses, full conversation management, and secure key storage.

## Tech Stack
- **Framework**: Next.js (latest, App Router) + TypeScript (strict)
- **Styling**: Tailwind CSS + shadcn/ui + lucide-react icons
- **AI**: Vercel AI SDK (OpenAI-compatible provider, Anthropic, Google Gemini)
- **Database**: PostgreSQL (Neon) + Drizzle ORM with migrations
- **Auth**: Auth.js (NextAuth v5) — email+password (bcrypt), Google OAuth, GitHub OAuth
- **Validation**: Zod
- **Rate Limiting**: Upstash Redis (in-memory fallback in dev)
- **Deployment**: Vercel (primary), Dockerfile for self-hosting

## Core Features

### 1. Authentication
- Sign up, login, logout, forgot/reset password
- Protected routes via middleware
- Per-user data isolation on every query

### 2. Chat UI (ChatGPT-like)
- **Sidebar**: New chat, conversation list grouped by date, search, rename, delete, pin
- **Main area**: Streaming token-by-token, Stop/Regenerate/Edit+Branch/Copy/Thumbs up-down
- **Markdown**: GFM tables, syntax-highlighted code blocks with copy, LaTeX (KaTeX)
- **Thinking**: Collapsible reasoning section for models that return reasoning tokens
- **Auto-title**: Generated via user's selected model
- **UX**: Auto-scroll + jump-to-latest, skeletons, error+retry, responsive (mobile drawer), dark/light/system theme
- **Keyboard shortcuts**: Ctrl+K search, Ctrl+Shift+O new chat, Enter send, Shift+Enter newline

### 3. Bring-Your-Own-Model Settings
- Multiple "Model Connections" per user
- Provider types: OpenAI-compatible, OpenAI, Anthropic, Google Gemini, OpenRouter, Ollama, LM Studio
- Fields: display name, provider, base URL, API key, model ID, default params (temperature, top_p, max_tokens, reasoning_effort)
- "Fetch models" button, "Test connection" button, set default, switch model per chat
- **Security**: AES-256-GCM encryption for API keys, show only last 4 chars, SSRF protection
- **Connection modes**: Server mode (proxied) and Browser mode (direct from browser for localhost)

### 4. Personalization
- Custom instructions (About me / How to respond)
- Per-chat system prompt + saved prompt templates
- Optional memory: user-editable remembered facts, toggleable

### 5. Attachments
- Image upload/paste (base64 for vision models)
- Text/PDF/code file upload with extraction
- Store in Vercel Blob or S3-compatible; size limits enforced

### 6. Conversation Management
- Export as Markdown/JSON/PDF, delete all, share read-only link (revocable)
- Import/export settings
- Context trimming with configurable window, token usage estimate

### 7. Safety & Abuse Protection
- Rate limiting per user and IP, request size limits
- CSRF, secure cookies, security headers, input sanitization
- Audit log for login and key changes
- Optional admin toggle to disable signups

## Database Schema
- users, accounts, sessions (per auth lib)
- conversations (id, userId, title, pinned, modelConnectionId, systemPrompt, createdAt, updatedAt)
- messages (id, conversationId, role, content, reasoning, attachments jsonb, parentId, model, tokens, createdAt)
- model_connections (id, userId, name, provider, baseUrl, encryptedApiKey, iv, modelId, params jsonb, mode, isDefault)
- user_settings, memories, shared_links, prompt_templates

## Phases
1. Scaffold, DB schema, auth, layout, theming
2. Basic chat with streaming, saving to DB, sidebar history
3. Model Connections settings (server mode), encryption, SSRF
4. Browser mode, reasoning display, regenerate, edit/branching, stop
5. Attachments, custom instructions, memory, templates, export, share
6. Rate limiting, security hardening, tests, README, deployment
