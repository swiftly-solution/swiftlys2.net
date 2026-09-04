"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { ConvarsModuleIndexEntry } from "@/lib/convars/queries";
import { countActiveFilters, matchesFilters } from "@/lib/convars/filter";
import { useConvarsFilters } from "@/components/convars/filter-context";

type Row =
    | { type: "header"; module: string; count: number }
    | {
          type: "item";
          module: string;
          name: string;
          kind: "convar" | "concommand";
      };

type StreamMessage =
    | { type: "module"; module: string; count: number }
    | {
          type: "item";
          module: string;
          name: string;
          kind: "convar" | "concommand";
          flags: string[];
          attrs: string[];
      };

type Status = "loading" | "done" | "error";

const HEADER_ROW_HEIGHT = 40;
const ITEM_ROW_HEIGHT = 30;

export function ConvarsSidebar({ gameId }: { gameId: string }) {
    const [modules, setModules] = useState<ConvarsModuleIndexEntry[]>([]);
    const [status, setStatus] = useState<Status>("loading");
    const [query, setQuery] = useState("");
    const [openModules, setOpenModules] = useState<Set<string>>(new Set());
    const scrollRef = useRef<HTMLDivElement>(null);
    const { filters } = useConvarsFilters();
    const filtersActive = countActiveFilters(filters) > 0;

    useEffect(() => {
        const order: string[] = [];
        const byModule = new Map<string, ConvarsModuleIndexEntry>();
        let cancelled = false;

        setModules([]);
        setStatus("loading");

        async function run() {
            try {
                const res = await fetch(`/api/convars/modules?game=${gameId}`);
                if (!res.ok || !res.body) {
                    if (!cancelled) setStatus("error");
                    return;
                }

                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let buffer = "";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split("\n");
                    buffer = lines.pop() ?? "";

                    for (const line of lines) {
                        if (!line) continue;
                        const msg = JSON.parse(line) as StreamMessage;

                        let mod = byModule.get(msg.module);
                        if (!mod) {
                            mod = { module: msg.module, items: [] };
                            byModule.set(msg.module, mod);
                            order.push(msg.module);
                        }
                        if (msg.type === "item") {
                            mod.items.push({
                                name: msg.name,
                                kind: msg.kind,
                                flags: msg.flags ?? [],
                                attrs: msg.attrs ?? [],
                            });
                        }
                    }

                    if (!cancelled) {
                        setModules(
                            order.map((module) => {
                                const mod = byModule.get(module)!;
                                return { module, items: [...mod.items] };
                            }),
                        );
                    }
                }

                if (!cancelled) setStatus("done");
            } catch {
                if (!cancelled) setStatus("error");
            }
        }

        run();
        return () => {
            cancelled = true;
        };
    }, [gameId]);

    const normalizedQuery = query.trim().toLowerCase();

    const visibleModules = useMemo(() => {
        if (!normalizedQuery && !filtersActive) return modules;
        return modules
            .map((module) => ({
                ...module,
                items: module.items.filter(
                    (item) =>
                        (!normalizedQuery ||
                            item.name.toLowerCase().includes(normalizedQuery)) &&
                        (!filtersActive ||
                            matchesFilters(
                                {
                                    kind: item.kind,
                                    module: module.module,
                                    flags: item.flags,
                                    attrs: item.attrs,
                                },
                                filters,
                            )),
                ),
            }))
            .filter((module) => module.items.length > 0);
    }, [modules, normalizedQuery, filtersActive, filters]);

    const isOpen = (module: string) =>
        normalizedQuery.length > 0 || filtersActive || openModules.has(module);

    const toggleModule = (module: string) => {
        setOpenModules((prev) => {
            const next = new Set(prev);
            if (next.has(module)) next.delete(module);
            else next.add(module);
            return next;
        });
    };

    const rows = useMemo<Row[]>(() => {
        const result: Row[] = [];
        for (const mod of visibleModules) {
            result.push({
                type: "header",
                module: mod.module,
                count: mod.items.length,
            });
            if (isOpen(mod.module)) {
                for (const item of mod.items) {
                    result.push({
                        type: "item",
                        module: mod.module,
                        name: item.name,
                        kind: item.kind,
                    });
                }
            }
        }
        return result;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visibleModules, openModules, normalizedQuery, filtersActive]);

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
                        placeholder="grep convar"
                        className="w-full bg-transparent text-white placeholder:text-zinc-600 focus:outline-none"
                    />
                </div>
            </div>

            <div
                ref={scrollRef}
                className="max-h-[calc(100vh-11rem)] overflow-y-auto"
            >
                {status === "error" && (
                    <p className="px-4 py-6 text-center font-mono text-xs text-zinc-600">
                        ConVar data is temporarily unavailable.
                    </p>
                )}

                {status === "done" && rows.length === 0 && (
                    <p className="px-4 py-6 text-center font-mono text-xs text-zinc-600">
                        No matches.
                    </p>
                )}

                {rows.length > 0 && (
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
                                        onClick={() => toggleModule(row.module)}
                                        aria-expanded={isOpen(row.module)}
                                        style={style}
                                        className="flex items-center justify-between border-t border-white/5 px-4 text-left transition-colors first:border-t-0 hover:bg-white/[0.03]"
                                    >
                                        <span className="font-mono text-sm text-white">
                                            {row.module}
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
                                    href={`/convars-viewer/${gameId}/${row.module}/${encodeURIComponent(row.name)}`}
                                    style={style}
                                    className="flex items-center gap-2 px-4 font-mono text-xs text-zinc-400 transition-colors hover:bg-white/[0.03] hover:text-accent"
                                >
                                    <span
                                        className={
                                            row.kind === "concommand"
                                                ? "text-amber-400"
                                                : "text-accent"
                                        }
                                    >
                                        {row.kind === "concommand" ? "X" : "V"}
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
