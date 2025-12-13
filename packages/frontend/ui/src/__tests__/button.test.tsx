import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "../primitives/button";

describe("Button", () => {
    it("renders children correctly", () => {
        render(<Button>Click me</Button>);
        expect(screen.getByRole("button")).toHaveTextContent("Click me");
    });

    it("applies primary variant styles by default", () => {
        render(<Button>Primary</Button>);
        const button = screen.getByRole("button");
        expect(button).toHaveClass("bg-black");
        expect(button).toHaveClass("text-white");
    });

    it("applies outline variant styles", () => {
        render(<Button variant="outline">Outline</Button>);
        const button = screen.getByRole("button");
        expect(button).toHaveClass("bg-white");
        expect(button).toHaveClass("text-black");
    });

    it("applies ghost variant styles", () => {
        render(<Button variant="ghost">Ghost</Button>);
        const button = screen.getByRole("button");
        expect(button).toHaveClass("bg-transparent");
    });

    it("handles click events", () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Clickable</Button>);

        fireEvent.click(screen.getByRole("button"));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("applies custom className", () => {
        render(<Button className="custom-class">Custom</Button>);
        expect(screen.getByRole("button")).toHaveClass("custom-class");
    });

    it("can be disabled", () => {
        render(<Button disabled>Disabled</Button>);
        expect(screen.getByRole("button")).toBeDisabled();
    });

    it("applies disabled styles when disabled", () => {
        render(<Button disabled>Disabled</Button>);
        expect(screen.getByRole("button")).toHaveClass("disabled:opacity-60");
    });
});
