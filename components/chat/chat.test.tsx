// @ts-nocheck
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { Chat } from "./chat";

// Mock useChat hook
vi.mock("@ai-sdk/react", () => ({
  useChat: () => ({
    messages: [
      { id: "1", role: "user", content: "Hello" },
      { id: "2", role: "assistant", content: "Hi there!" }
    ],
    input: "",
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
    isLoading: false,
    stop: vi.fn(),
    append: vi.fn(),
    reload: vi.fn(),
  })
}));

vi.mock("@/server/actions/chat-actions", () => ({
  updateChatConnectionAction: vi.fn()
}));

describe("Chat", () => {
  it("renders messages and chat input", () => {
    render(<Chat />);
    
    // Check if MessageList is rendered with mocked messages
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("Hi there!")).toBeInTheDocument();
    
    // Check if ChatInput is rendered
    expect(screen.getByPlaceholderText("Type a message...")).toBeInTheDocument();
  });
});

