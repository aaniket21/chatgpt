// @ts-nocheck
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { ConnectionForm } from "./connection-form";

describe("ConnectionForm", () => {
  it("renders correctly", () => {
    render(<ConnectionForm onSubmit={vi.fn()} />);
    
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Provider/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/API Key/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });
});

