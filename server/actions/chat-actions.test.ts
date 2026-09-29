import { describe, it, expect, vi } from "vitest";

// Mock dependencies
vi.mock("@/server/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "1" } })
}));
vi.mock("@/db", () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue([{ id: "test-id" }])
    })
  }
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn()
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

import { createChatAction } from "./chat-actions";

describe("createChatAction", () => {
  it("is exported as a function", () => {
    expect(typeof createChatAction).toBe("function");
  });
});
