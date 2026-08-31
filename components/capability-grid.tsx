"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
    capabilities,
    capabilityCategories,
    type CapabilityCategory,
} from "@/lib/capabilities";

type Filter = "All" | CapabilityCategory;

const FILTERS: Filter[] = ["All", ...capabilityCategories];

export function CapabilityGrid() {
    const [filter, setFilter] = useState<Filter>("All");
    const filtered =
        filter === "All"
            ? capabilities
            : capabilities.filter((c) => c.category === filter);

    const tabsRef = useRef<HTMLDivElement>(null);
    const buttonRefs = useRef<Map<Filter, HTMLButtonElement>>(new Map());
    const [highlight, setHighlight] = useState<{
        left: number;
        top: number;
        width: number;
        height: number;
    } | null>(null);

    useLayoutEffect(() => {
        const container = tabsRef.current;
        const button = buttonRefs.current.get(filter);
        if (!container || !button) return;

        const update = () => {
            const containerRect = container.getBoundingClientRect();
            const buttonRect = button.getBoundingClientRect();
            setHighlight({
                left: buttonRect.left - containerRect.left,
                top: buttonRect.top - containerRect.top,
                width: buttonRect.width,
                height: buttonRect.height,
            });
        };

        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, [filter]);

    return (
        <section id="capabilities" className="mx-auto mt-16 max-w-6xl px-6">
            <div ref={tabsRef} className="relative flex flex-wrap gap-2">
                {highlight && (
                    <div
                        className="pointer-events-none absolute rounded-full border border-accent/40 bg-accent/10 transition-all duration-300 ease-out motion-reduce:transition-none"
                        style={{
                            left: highlight.left,
                            top: highlight.top,
                            width: highlight.width,
                            height: highlight.height,
                        }}
                    />
                )}
                {FILTERS.map((category) => {
                    const active = category === filter;
                    return (
                        <button
                            key={category}
                            ref={(node) => {
                                if (node)
                                    buttonRefs.current.set(category, node);
                                else buttonRefs.current.delete(category);
                            }}
                            onClick={() => setFilter(category)}
                            className={`relative rounded-full border border-transparent px-4 py-1.5 text-sm transition-colors ${
                                active
                                    ? "text-accent"
                                    : "text-zinc-400 hover:text-white"
                            }`}
                        >
                            {category}
                        </button>
                    );
                })}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((capability, index) => (
                    <div
                        key={`${filter}-${capability.title}`}
                        style={{ animationDelay: `${index * 30}ms` }}
                        className="group animate-card-in rounded-xl border border-white/10 bg-zinc-950/40 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5"
                    >
                        <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold text-white">
                                {capability.title}
                            </h3>
                            <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-zinc-500">
                                {capability.category}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-zinc-500">
                            {capability.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
