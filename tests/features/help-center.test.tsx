import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { HelpCenter } from "@/components/help/HelpCenter";
import { articles } from "@/data/articles";
import { searchArticles } from "@/lib/articles";

function setup(initialQuery?: string) {
  const user = userEvent.setup();
  render(<HelpCenter initialQuery={initialQuery} />);
  return { user, search: screen.getByRole("searchbox", { name: "How can we help?" }) };
}

describe("Help Center search", () => {
  it("lists every article by category before searching", () => {
    setup();
    expect(screen.getByText(`${articles.length} articles`)).toBeInTheDocument();
    for (const category of ["Account Management", "Debit Cards", "Transfers and Payments", "Fees and Charges", "Security"]) {
      expect(screen.getByRole("heading", { level: 2, name: category })).toBeInTheDocument();
    }
  });

  it("returns relevant articles for a keyword search", async () => {
    const { user, search } = setup();
    await user.type(search, "overdraft");

    const results = screen.getByRole("list", { name: "Help articles" });
    const links = within(results).getAllByRole("link");
    expect(links[0]).toHaveAccessibleName(/Understanding overdraft fees/);
    expect(screen.getByText(/articles? found for “overdraft”/)).toBeInTheDocument();
  });

  it("understands a natural-language question", async () => {
    const { user, search } = setup();
    await user.type(search, "why is my transfer late");
    const first = within(screen.getByRole("list", { name: "Help articles" })).getAllByRole("link")[0];
    expect(first).toHaveAccessibleName(/Why an external transfer may be delayed/);
  });

  it("shows an empty state with a way forward when nothing matches", async () => {
    const { user, search } = setup();
    await user.type(search, "cryptocurrency mortgage");

    expect(screen.getByRole("heading", { name: "No articles match your search" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Submit a support request" })).toHaveAttribute("href", "/support/new");

    await user.click(screen.getByRole("button", { name: "Clear search" }));
    expect(search).toHaveValue("");
    expect(screen.getByText(`${articles.length} articles`)).toBeInTheDocument();
  });

  it("filters by category and combines with search", async () => {
    const { user, search } = setup();
    const security = screen.getByRole("button", { name: "Security" });
    await user.click(security);
    expect(security).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("4 articles in Security")).toBeInTheDocument();

    await user.type(search, "phishing");
    const links = within(screen.getByRole("list", { name: "Help articles" })).getAllByRole("link");
    expect(links[0]).toHaveAccessibleName(/Recognizing phishing attempts/);
    links.forEach((link) => expect(link).toHaveTextContent("Security"));
  });

  it("applies suggested searches", async () => {
    const { user, search } = setup();
    await user.click(screen.getByRole("button", { name: "hold" }));
    expect(search).toHaveValue("hold");
    expect(screen.getByRole("link", { name: /Understanding temporary authorization holds/ })).toBeInTheDocument();
  });
});

describe("searchArticles", () => {
  it("matches plural and past-tense variants", () => {
    expect(searchArticles("declined")[0].slug).toBe("card-declined");
    expect(searchArticles("ATM fees")[0].slug).toBe("atm-fees");
  });

  it("ignores filler words and returns everything for an empty query", () => {
    expect(searchArticles("   ")).toHaveLength(articles.length);
    expect(searchArticles("what is the")).toHaveLength(articles.length);
  });
});
