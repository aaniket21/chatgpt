// @ts-nocheck
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { MessageList } from "./message-list";

describe("MessageList", () => {
  it("renders a list of messages", () => {
    const messages = [
      { id: "1", role: "user" as const, content: "Message 1" },
      { id: "2", role: "assistant" as const, content: "Message 2" },
    ];
    
    render(<MessageList messages={messages} />);
    
    expect(screen.getByText("Message 1")).toBeInTheDocument();
    expect(screen.getByText("Message 2")).toBeInTheDocument();
  });

  it("shows an empty state when there are no messages", () => {
    render(<MessageList messages={[]} />);
    
    // Depending on what empty state text we want to show, let's just assert it renders something empty
    expect(screen.getByText(/Send a message to start/i)).toBeInTheDocument();
  });
});

