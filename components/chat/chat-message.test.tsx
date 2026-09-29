// @ts-nocheck
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { ChatMessage } from "./chat-message";

describe("ChatMessage", () => {
  it("renders a user message correctly", () => {
    render(
      <ChatMessage 
        message={{ id: "1", role: "user", content: "Hello AI" }} 
      />
    );
    
    expect(screen.getByText("Hello AI")).toBeInTheDocument();
  });

  it("renders an assistant message correctly with markdown", () => {
    render(
      <ChatMessage 
        message={{ id: "2", role: "assistant", content: "**Bold Text** and `code`" }} 
      />
    );
    
    // Check if markdown rendered (the text content is there)
    expect(screen.getByText("Bold Text")).toBeInTheDocument();
    expect(screen.getByText("code")).toBeInTheDocument();
  });
});

