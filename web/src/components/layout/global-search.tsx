"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { useKeyboard } from "@/hooks/use-keyboard";

const SEARCH_TARGETS = [
  { label: "AI Dashboard", href: ROUTES.dashboard, keywords: "home overview personalization widgets" },
  { label: "Workspace", href: ROUTES.workspace, keywords: "tasks goals notes calendar focus productivity" },
  { label: "Workspace Tasks", href: "/workspace/tasks", keywords: "kanban board due dates" },
  { label: "Focus Mode", href: "/workspace/focus", keywords: "pomodoro timer break" },
  { label: "Goals", href: ROUTES.goals, keywords: "targets plans" },
  { label: "Roadmap", href: ROUTES.roadmap, keywords: "career path" },
  { label: "Tasks", href: ROUTES.tasks, keywords: "todo work" },
  { label: "AI Studio", href: ROUTES.ai, keywords: "mentor teacher resume" },
  { label: "AI Mentor", href: ROUTES.mentor, keywords: "chat guidance" },
  { label: "Career Intel", href: "/ai/career", keywords: "jobs interview resume placement" },
  { label: "Research", href: ROUTES.research, keywords: "notes editor pdf workspace" },
  { label: "Community", href: ROUTES.community, keywords: "discussion teams mentors messages" },
  { label: "Learn", href: ROUTES.learn, keywords: "animation video lesson adaptive quiz" },
  { label: "Learning Analytics", href: "/learn/analytics", keywords: "streak progress achievements" },
  { label: "Books", href: ROUTES.books, keywords: "library reading knowledge smart" },
  { label: "Smart search", href: "/books/search", keywords: "discover books catalog" },
  { label: "Knowledge Explorer", href: "/books/explorer", keywords: "topics graph concepts" },
  { label: "Reports", href: ROUTES.reports, keywords: "research" },
  { label: "Institution", href: ROUTES.institution, keywords: "campus admin" },
  { label: "Settings", href: ROUTES.settings, keywords: "profile account" },
] as const;

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useKeyboard((event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      setOpen(true);
    }
  });

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SEARCH_TARGETS;
    return SEARCH_TARGETS.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.keywords.includes(q) ||
        item.href.includes(q),
    );
  }, [query]);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="text-muted-foreground hidden h-8 gap-2 md:inline-flex"
        onClick={() => setOpen(true)}
        aria-label="Open global search"
      >
        <Search className="size-3.5" />
        Search
        <kbd className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px]">
          ⌘K
        </kbd>
      </Button>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        className="md:hidden"
        aria-label="Open global search"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery("");
        }}
        title="Global search"
        description="Jump to any major platform area."
        className="max-w-xl"
      >
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search modules…"
          className="mb-3 h-10"
          autoFocus
          aria-label="Search modules"
        />
        <ul className="max-h-72 space-y-1 overflow-y-auto">
          {results.length === 0 ? (
            <li className="text-muted-foreground px-2 py-6 text-center text-sm">
              No matches
            </li>
          ) : (
            results.map((item) => (
              <li key={item.href}>
                <button
                  type="button"
                  className="nav-feedback hover:bg-muted focus-visible:ring-ring flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm outline-none focus-visible:ring-2"
                  onClick={() => {
                    setOpen(false);
                    router.push(item.href);
                  }}
                >
                  <span>{item.label}</span>
                  <span className="text-muted-foreground text-xs">{item.href}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </Dialog>
    </>
  );
}
