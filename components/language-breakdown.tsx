"use client";

import { useEffect, useRef, useState } from "react";
import type { LanguageShare } from "@/lib/github";

const SEGMENT_COLORS = ["#00feed", "#3f3f46", "#52525b", "#71717a", "#a1a1aa"];

export function LanguageBreakdown({
    languages,
}: {
    languages: LanguageShare[];
}) {
    const barRef = useRef<HTMLDivElement>(null);
    const [filled, setFilled] = useState(false);

    useEffect(() => {
        const node = barRef.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setFilled(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.4 },
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    if (languages.length === 0) return null;

    return (
        <div className="mx-auto mt-6 max-w-6xl px-6">
            <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6">
                <div className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                    Language breakdown
                </div>

                <div
                    ref={barRef}
                    className="mt-4 flex h-2 overflow-hidden rounded-full bg-zinc-800"
                >
                    {languages.map((lang, i) => (
                        <div
                            key={lang.name}
                            className="transition-[width] duration-1000 ease-out motion-reduce:transition-none"
                            style={{
                                width: `${filled ? lang.percent : 0}%`,
                                transitionDelay: `${i * 80}ms`,
                                backgroundColor:
                                    SEGMENT_COLORS[i % SEGMENT_COLORS.length],
                            }}
                        />
                    ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-zinc-400">
                    {languages.map((lang, i) => (
                        <div
                            key={lang.name}
                            className="flex items-center gap-1.5"
                        >
                            <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{
                                    backgroundColor:
                                        SEGMENT_COLORS[
                                            i % SEGMENT_COLORS.length
                                        ],
                                }}
                            />
                            {lang.name}{" "}
                            <span className="text-zinc-600">
                                {lang.percent.toFixed(1)}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
