import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { THEME_STORAGE_KEY, ThemeToggle } from "./ThemeToggle";

describe("ThemeToggle", () => {
  it("alterna e persiste o modo escuro", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(
      screen.getByRole("button", { name: "Ativar modo escuro" }),
    );

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(
      screen.getByRole("button", { name: "Ativar modo claro" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
