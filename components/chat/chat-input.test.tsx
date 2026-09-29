// @ts-nocheck
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { ChatInput } from "./chat-input";

describe("ChatInput", () => {
  it("renders a textarea and a submit button", () => {
    const handleSubmit = vi.fn();
    render(<ChatInput onSubmit={handleSubmit} isLoading={false} />);
    
    expect(screen.getByPlaceholderText("Type a message...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  it("calls onSubmit with the input value when the form is submitted", () => {
    const handleSubmit = vi.fn();
    render(<ChatInput onSubmit={handleSubmit} isLoading={false} />);
    
    const input = screen.getByPlaceholderText("Type a message...");
    const button = screen.getByRole("button", { name: /send/i });

    fireEvent.change(input, { target: { value: "Hello world" } });
    fireEvent.click(button);

    expect(handleSubmit).toHaveBeenCalledWith("Hello world", undefined);
  });

  it("disables the submit button when input is empty", () => {
    const handleSubmit = vi.fn();
    render(<ChatInput onSubmit={handleSubmit} isLoading={false} />);
    
    const button = screen.getByRole("button", { name: /send/i });
    expect(button).toBeDisabled();
  });

  it("clears the input after submission", () => {
    const handleSubmit = vi.fn();
    render(<ChatInput onSubmit={handleSubmit} isLoading={false} />);
    
    const input = screen.getByPlaceholderText("Type a message...") as HTMLTextAreaElement;
    const button = screen.getByRole("button", { name: /send/i });

    fireEvent.change(input, { target: { value: "Hello world" } });
    fireEvent.click(button);

    expect(input.value).toBe("");
  });
});

