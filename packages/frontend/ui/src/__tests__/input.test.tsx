import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "../primitives/input";

describe("Input", () => {
    it("renders correctly", () => {
        render(<Input placeholder="Enter text" />);
        expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
    });

    it("accepts and displays value", () => {
        render(<Input defaultValue="Test value" />);
        expect(screen.getByDisplayValue("Test value")).toBeInTheDocument();
    });

    it("handles change events", () => {
        const handleChange = vi.fn();
        render(<Input onChange={handleChange} />);

        const input = screen.getByRole("textbox");
        fireEvent.change(input, { target: { value: "new value" } });

        expect(handleChange).toHaveBeenCalled();
    });

    it("applies custom className", () => {
        render(<Input className="custom-input" data-testid="input" />);
        expect(screen.getByTestId("input")).toHaveClass("custom-input");
    });

    it("can be disabled", () => {
        render(<Input disabled />);
        expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("forwards ref correctly", () => {
        const ref = { current: null };
        render(<Input ref={ref} />);
        expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it("applies base styling classes", () => {
        render(<Input data-testid="input" />);
        const input = screen.getByTestId("input");
        expect(input).toHaveClass("border-2");
        expect(input).toHaveClass("border-black");
        expect(input).toHaveClass("bg-white");
    });
});
