"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Menu, X } from "lucide-react";
import { DocsSearch } from "@/components/docs/docs-search";

export type DocsNavItem = {
    slug: string;
    title: string;
    children?: DocsNavItem[];
};

function hrefFor(slug: string): string {
    return slug === "_index" ? "/docs" : `/docs/${slug}`;
}

function containsPath(item: DocsNavItem, pathname: string): boolean {
    if (hrefFor(item.slug) === pathname) return true;
    return (
        item.children?.some((child) => containsPath(child, pathname)) ?? false
    );
}

function NavNode({ item, pathname }: { item: DocsNavItem; pathname: string }) {
    const [open, setOpen] = useState(() => containsPath(item, pathname));
    const hasChildren = (item.children?.length ?? 0) > 0;

    if (!hasChildren) {
        const href = hrefFor(item.slug);
        const isActive = pathname === href;
        return (
            <Link
                href={href}
                className={`block rounded-lg px-3 py-2 font-mono text-sm transition-colors ${
                    isActive
                        ? "bg-white/5 text-accent"
                        : "text-zinc-400 hover:bg-white/[0.03] hover:text-white"
                }`}
            >
                {item.title}
            </Link>
        );
    }

    return (
        <div>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 font-mono text-sm text-zinc-300 transition-colors hover:bg-white/[0.03] hover:text-white"
            >
                {item.title}
                <ChevronRight
                    className={`h-3.5 w-3.5 text-zinc-600 transition-transform ${open ? "rotate-90" : ""}`}
                />
            </button>
            {open && (
                <div className="ml-3 space-y-1 border-l border-white/10 pl-2">
                    {item.children!.map((child) => (
                        <NavNode
                            key={child.slug}
                            item={child}
                            pathname={pathname}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export function DocsSidebar({ items }: { items: DocsNavItem[] }) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    return (
        <nav className="space-y-3 lg:sticky lg:top-20 lg:h-fit">
            <DocsSearch />

            <button
                type="button"
                onClick={() => setMobileOpen((o) => !o)}
                aria-expanded={mobileOpen}
                className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-zinc-950/40 px-3 py-2 font-mono text-sm text-zinc-300 lg:hidden"
            >
                <span className="flex items-center gap-2">
                    {mobileOpen ? (
                        <X className="h-4 w-4" />
                    ) : (
                        <Menu className="h-4 w-4" />
                    )}
                    Docs menu
                </span>
            </button>

            <div
                className={`space-y-1 rounded-2xl border border-white/10 bg-zinc-950/40 p-3 ${
                    mobileOpen ? "block" : "hidden"
                } lg:block`}
            >
                {items.map((item) => (
                    <NavNode key={item.slug} item={item} pathname={pathname} />
                ))}
            </div>
        </nav>
    );
}
