"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { ModuleIndexEntry } from "@/lib/schema/queries";

type Row =
    | { type: "header"; project: string; count: number }
    | {
          type: "item";
          project: string;
          name: string;
          kind: "class" | "enum";
      };

const HEADER_ROW_HEIGHT = 40;
const ITEM_ROW_HEIGHT = 30;

export function SchemaSidebar({
    modules,
    gameId,
}: {
    modules: ModuleIndexEntry[];
    gameId: string;
}) {
    const [query, setQuery] = useState("");
    const [openModules, setOpenModules] = useState<Set<string>>(new Set());
    const scrollRef = useRef<HTMLDivElement>(null);

    const normalizedQuery = query.trim().toLowerCase();

    const visibleModules = useMemo(() => {
        if (!normalizedQuery) return modules;
        return modules
            .map((module) => ({
                ...module,
                items: module.items.filter((item) =>
                    item.name.toLowerCase().includes(normalizedQuery),
                ),
            }))
            .filter((module) => module.items.length > 0);
    }, [modules, normalizedQuery]);

    const isOpen = (project: string) =>
        normalizedQuery.length > 0 || openModules.has(project);

    const toggleModule = (project: string) => {
        setOpenModules((prev) => {
            const next = new Set(prev);
            if (next.has(project)) next.delete(project);
            else next.add(project);
            return next;
        });
    };

    const rows = useMemo<Row[]>(() => {
        const result: Row[] = [];
        for (const mod of visibleModules) {
            result.push({
                type: "header",
                project: mod.project,
                count: mod.items.length,
            });
            if (isOpen(mod.project)) {
                for (const item of mod.items) {
                    result.push({
                        type: "item",
                        project: mod.project,
                        name: item.name,
                        kind: item.kind,
                    });
                }
            }
        }
        return result;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visibleModules, openModules, normalizedQuery]);

    // eslint-disable-next-line react-hooks/incompatible-library
    const virtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => scrollRef.current,
        estimateSize: (index) =>
            rows[index].type === "header" ? HEADER_ROW_HEIGHT : ITEM_ROW_HEIGHT,
        overscan: 12,
    });

    return (
        <div className="sticky top-20 rounded-2xl border border-white/10 bg-zinc-950/40">
            <div className="border-b border-white/10 p-3">
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-sm">
                    <span className="text-zinc-600">$</span>
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="grep classname"
                        className="w-full bg-transparent text-white placeholder:text-zinc-600 focus:outline-none"
                    />
                </div>
            </div>

            <div
                ref={scrollRef}
                className="max-h-[calc(100vh-11rem)] overflow-y-auto"
            >
                {rows.length === 0 ? (
                    <p className="px-4 py-6 text-center font-mono text-xs text-zinc-600">
                        No matches.
                    </p>
                ) : (
                    <div
                        style={{
                            height: virtualizer.getTotalSize(),
                            position: "relative",
                        }}
                    >
                        {virtualizer.getVirtualItems().map((virtualRow) => {
                            const row = rows[virtualRow.index];
                            const style = {
                                position: "absolute" as const,
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: virtualRow.size,
                                transform: `translateY(${virtualRow.start}px)`,
                            };

                            if (row.type === "header") {
                                return (
                                    <button
                                        key={virtualRow.key}
                                        onClick={() =>
                                            toggleModule(row.project)
                                        }
                                        aria-expanded={isOpen(row.project)}
                                        style={style}
                                        className="flex items-center justify-between border-t border-white/5 px-4 text-left transition-colors first:border-t-0 hover:bg-white/[0.03]"
                                    >
                                        <span className="font-mono text-sm text-white">
                                            {row.project}
                                        </span>
                                        <span className="font-mono text-xs text-zinc-500">
                                            {row.count}
                                        </span>
                                    </button>
                                );
                            }

                            return (
                                <Link
                                    key={virtualRow.key}
                                    href={`/schema-viewer/${gameId}/${row.project}/${encodeURIComponent(row.name)}`}
                                    style={style}
                                    className="flex items-center gap-2 px-4 font-mono text-xs text-zinc-400 transition-colors hover:bg-white/[0.03] hover:text-accent"
                                >
                                    <span
                                        className={
                                            row.kind === "enum"
                                                ? "text-amber-400"
                                                : "text-accent"
                                        }
                                    >
                                        {row.kind === "enum" ? "E" : "C"}
                                    </span>
                                    <span className="truncate">{row.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
