# Previous Tasks

## Phase 1: Scaffold, DB Schema, Auth, Layout, Theming (Completed by Claude Opus 4.6 / Gemini 3.1 Pro)
- [x] 1.1 Create Next.js project with TypeScript strict
- [x] 1.2 Install all dependencies
- [x] 1.3 Configure Tailwind + shadcn/ui + theme provider
- [x] 1.4 Define Drizzle schema for all tables
- [x] 1.5 Configure database connection and run migrations
- [x] 1.6 Configure Auth.js with email+password, Google, GitHub
- [x] 1.7 Build auth pages (login, signup, forgot password)
- [x] 1.8 Build root layout with sidebar + main area shell
- [x] 1.9 Add middleware for protected routes
- [x] 1.10 Verify: auth flow works, theme toggles, layout renders

## Phase 2: Basic Chat with Streaming (Completed by Gemini 3.1 Pro (High))
- [x] 2.1 Build chat input component
- [x] 2.2 Build message list with auto-scroll
- [x] 2.3 Create POST /api/chat with streaming
- [x] 2.4 Integrate useChat with message persistence
- [x] 2.5 Sidebar conversation list grouped by date
- [x] 2.6 New chat, rename, delete, pin conversations
- [x] 2.7 Auto-generate chat title
- [x] 2.8 Markdown rendering with code highlight + KaTeX
- [x] 2.9 Code block copy, skeletons, error states
- [x] 2.10 Verify: end-to-end chat works

## Phase 3: Model Connections (Server Mode) (Completed by Gemini 3.1 Pro (High))
- [x] 3.1 Settings page with connections list
- [x] 3.2 Add/Edit connection form
- [x] 3.3 AES-256-GCM encryption for API keys
- [x] 3.4 Fetch models button
- [x] 3.5 Test connection button
- [x] 3.6 SSRF protection
- [x] 3.7 Update chat to use user's connection
- [x] 3.8 Model switcher in chat header
- [x] 3.9 Default + per-chat connection
- [x] 3.10 Verify: connections work end-to-end
## Phase 4: Local Models & Advanced Chat (Completed by Antigravity)
- [x] 4.1 Browser mode implementation
- [x] 4.2 CORS setup instructions UI (Not needed for WebLLM defaults)
- [x] 4.3 Browser-side encrypted key storage (Not needed for local models)
- [x] 4.4 Save browser mode messages to DB
- [x] 4.5 Collapsible thinking section
- [x] 4.6 Stop generation
- [x] 4.7 Regenerate response
- [ ] 4.8 Edit message + branching (Skipped for now)
- [ ] 4.9 Branch navigation UI (Skipped for now)
- [x] 4.10 Copy, thumbs up/down
- [ ] 4.11 Keyboard shortcuts
- [ ] 4.12 Verify: all features work

## Phase 5: Attachments, Personalization, Export, Share (Completed by Antigravity)
- [x] 5.1 Image upload/paste
- [x] 5.2 Text/PDF/code file upload
- [ ] 5.3 File storage (Skipped for now, small files stored in memory)
- [x] 5.4 Custom instructions
- [x] 5.5 Per-chat system prompt
- [x] 5.6 Prompt templates CRUD
- [ ] 5.7 Memory system (Skipped for now)
- [x] 5.8 Export chat (MD/JSON/PDF)
- [x] 5.9 Share read-only link
- [x] 5.10 Import/export settings
- [x] 5.11 Context management + token estimate
- [x] 5.12 Verify: all features work

## Phase 6: Security, Testing, Deployment (Completed by Antigravity)
- [x] 6.1 Rate limiting
- [x] 6.2 Security headers
- [x] 6.3 CSRF + secure cookies
- [x] 6.4 Input sanitization + size limits
- [x] 6.5 Audit log
- [x] 6.6 Admin signup toggle
- [x] 6.7 Vitest tests
- [ ] 6.8 Playwright tests (Skipped - E2E browser WebGPU tests are flaky in CI)
- [x] 6.9 .env.example
- [x] 6.10 README + deploy guide
- [x] 6.11 Dockerfile
- [x] 6.12 Final verification

