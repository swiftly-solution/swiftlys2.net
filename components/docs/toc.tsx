"use client";

import { useEffect, useState } from "react";
import { List } from "lucide-react";
import type { OutlineItem } from "@/lib/docs/outline";

export function Toc({ items }: { items: OutlineItem[] }) {
    const [activeId, setActiveId] = useState<string | null>(null);

    useEffect(() => {
        if (items.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort(
                        (a, b) =>
                            a.boundingClientRect.top - b.boundingClientRect.top,
                    );
                if (visible.length > 0) {
                    setActiveId(visible[0].target.id);
                }
            },
            { rootMargin: "-96px 0px -70% 0px", threshold: 1 },
        );

        for (const item of items) {
            const el = document.getElementById(item.id);
            if (el) observer.observe(el);
        }

        return () => observer.disconnect();
    }, [items]);

    if (items.length === 0) return null;

    return (
        <nav className="sticky top-20 flex max-h-[calc(100vh-6rem)] flex-col">
            <div className="flex shrink-0 items-center gap-2 font-mono text-xs uppercase tracking-wide text-zinc-400">
                <List className="h-3.5 w-3.5" />
                On this page
            </div>
            <div className="mt-3 min-h-0 flex-1 space-y-1 overflow-y-auto border-l border-white/10">
                {items.map((item) => (
                    <a
                        key={item.id}
                        href={`#${item.id}`}
                        style={{
                            paddingLeft:
                                item.depth === 2 ? "1.5rem" : "0.75rem",
                        }}
                        className={`block border-l -ml-px py-1 font-mono text-xs transition-colors ${
                            activeId === item.id
                                ? "border-accent text-accent"
                                : "border-transparent text-zinc-400 hover:text-white"
                        }`}
                    >
                        {item.text}
                    </a>
                ))}
            </div>
        </nav>
    );
}
