import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Sidebar } from "@/components/layout/sidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));

describe("Sidebar", () => {
  it("renders the application title", () => {
    render(<Sidebar />);
    expect(screen.getByText("FibroSense")).toBeInTheDocument();
  });

  it("renders the Dashboard nav link", () => {
    render(<Sidebar />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("renders the Log nav link", () => {
    render(<Sidebar />);
    expect(screen.getByText("Log")).toBeInTheDocument();
  });

  it("renders the Correlations nav link", () => {
    render(<Sidebar />);
    expect(screen.getByText("Correlations")).toBeInTheDocument();
  });

  it("renders the Settings nav link", () => {
    render(<Sidebar />);
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("renders all 4 nav links", () => {
    render(<Sidebar />);
    const navLinks = ["Dashboard", "Log", "Correlations", "Settings"];
    navLinks.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it("nav links have correct href attributes", () => {
    render(<Sidebar />);
    const dashboardLink = screen.getByText("Dashboard").closest("a");
    const logLink = screen.getByText("Log").closest("a");
    const correlationsLink = screen.getByText("Correlations").closest("a");
    const settingsLink = screen.getByText("Settings").closest("a");

    expect(dashboardLink).toHaveAttribute("href", "/");
    expect(logLink).toHaveAttribute("href", "/log");
    expect(correlationsLink).toHaveAttribute("href", "/correlations");
    expect(settingsLink).toHaveAttribute("href", "/settings");
  });

  it("renders SVG icons for each nav item", () => {
    const { container } = render(<Sidebar />);
    const svgIcons = container.querySelectorAll("nav svg");
    expect(svgIcons.length).toBe(4);
  });
});
