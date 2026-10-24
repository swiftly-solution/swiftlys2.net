"use client";

import { useState } from "react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

export type RailItem = {
    tag: string;
    date: string;
    prerelease: boolean;
};

export function ReleaseRail({ items }: { items: RailItem[] }) {
    const current = useSelectedLayoutSegment();
    const currentTag = current ? decodeURIComponent(current) : null;
    const [beta, setBeta] = useState(
        () => items.find((i) => i.tag === currentTag)?.prerelease ?? false,
    );
    const visible = items.filter((i) => i.prerelease === beta);

    return (
        <nav className="min-w-0 lg:sticky lg:top-20 lg:self-start">
            <div className="mb-3 flex gap-1.5 text-xs">
                {[
                    { label: "Stable", value: false },
                    { label: "Beta", value: true },
                ].map((tab) => (
                    <button
                        key={tab.label}
                        type="button"
                        onClick={() => setBeta(tab.value)}
                        className={`rounded-md border px-3 py-1 transition-colors ${
                            beta === tab.value
                                ? "border-accent/40 bg-accent/10 text-accent"
                                : "border-white/10 text-zinc-400 hover:text-white"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <ul className="flex gap-1 overflow-x-auto pb-2 lg:max-h-[calc(100vh-10rem)] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pb-0">
                {visible.map((item) => (
                    <li key={item.tag} className="shrink-0">
                        <Link
                            href={`/releases/${encodeURIComponent(item.tag)}`}
                            className={`block rounded-md px-3 py-1.5 transition-colors ${
                                item.tag === currentTag
                                    ? "bg-accent/10 text-white"
                                    : "text-zinc-400 hover:bg-white/[0.03] hover:text-white"
                            }`}
                        >
                            <span className="block text-sm font-medium">
                                {item.tag}
                            </span>
                            <span className="block text-xs text-zinc-400">
                                {item.date}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
