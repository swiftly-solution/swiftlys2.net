"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import type { ApiBranch } from "@/lib/api-docs/types";
import {
    API_BRANCHES,
    apiDocsHref,
    apiDocsPrefix,
    type ApiNavCategory,
} from "@/lib/api-docs/tree";
import { ApiDocsSearch } from "@/components/api-docs/api-docs-search";

function hrefFor(branch: ApiBranch, categorySlug: string, typeSlug: string): string {
    return apiDocsHref(branch, categorySlug, typeSlug);
}

function CategoryNode({
    category,
    branch,
    pathname,
}: {
    category: ApiNavCategory;
    branch: ApiBranch;
    pathname: string;
}) {
    const containsActive = category.types.some(
        (type) => hrefFor(branch, category.slug, type.slug) === pathname,
    );
    const [open, setOpen] = useState(containsActive);

    return (
        <div>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left font-mono text-sm text-zinc-300 transition-colors hover:bg-white/[0.03] hover:text-white"
            >
                <span className="min-w-0">{category.name}</span>
                <ChevronRight
                    className={`h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform ${open ? "rotate-90" : ""}`}
                />
            </button>
            {open && (
                <div className="ml-3 space-y-1 border-l border-white/10 pl-2">
                    {category.types.map((type) => {
                        const href = hrefFor(branch, category.slug, type.slug);
                        const isActive = pathname === href;
                        return (
                            <Link
                                key={type.slug}
                                href={href}
                                className={`block rounded-lg px-3 py-2 font-mono text-sm transition-colors ${
                                    isActive
                                        ? "bg-white/5 text-accent"
                                        : "text-zinc-400 hover:bg-white/[0.03] hover:text-white"
                                }`}
                            >
                                {type.name}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export function ApiDocsSidebar({
    categories,
    branch,
}: {
    categories: ApiNavCategory[];
    branch: ApiBranch;
}) {
    const pathname = usePathname() ?? "";
    const currentPrefix = apiDocsPrefix(branch);
    const rest = pathname.startsWith(currentPrefix)
        ? pathname.slice(currentPrefix.length)
        : "";

    return (
        <nav className="sticky top-20 flex max-h-[calc(100vh-6rem)] flex-col gap-3">
            <div className="flex shrink-0 overflow-hidden rounded-lg border border-white/10 font-mono text-xs">
                {API_BRANCHES.map((b) =>
                    b === branch ? (
                        <span
                            key={b}
                            className="flex-1 bg-white/5 px-3 py-2 text-center uppercase tracking-wide text-accent"
                        >
                            {b}
                        </span>
                    ) : (
                        <Link
                            key={b}
                            href={`${apiDocsPrefix(b)}${rest}`}
                            className="flex-1 px-3 py-2 text-center uppercase tracking-wide text-zinc-400 transition-colors hover:text-white"
                        >
                            {b}
                        </Link>
                    ),
                )}
            </div>
            <div className="shrink-0">
                <ApiDocsSearch branch={branch} />
            </div>
            <div className="min-h-0 flex-1 space-y-1 overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950/40 p-3">
                {categories.map((category) => (
                    <CategoryNode key={category.slug} category={category} branch={branch} pathname={pathname} />
                ))}
            </div>
        </nav>
    );
}
