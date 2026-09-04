"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useVirtualizer } from "@tanstack/react-virtual";

type Row =
    | { type: "header"; file: string; count: number }
    | { type: "item"; file: string; name: string };

type StreamMessage =
    | { type: "module"; file: string; count: number }
    | { type: "item"; file: string; name: string; fieldCount: number };

type FileGroupEntry = {
    file: string;
    items: { name: string }[];
};

type Status = "loading" | "done" | "error";

const HEADER_ROW_HEIGHT = 40;
const ITEM_ROW_HEIGHT = 30;

export function GameEventsSidebar({ gameId }: { gameId: string }) {
    const [files, setFiles] = useState<FileGroupEntry[]>([]);
    const [status, setStatus] = useState<Status>("loading");
    const [openFiles, setOpenFiles] = useState<Set<string>>(new Set());
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const order: string[] = [];
        const byFile = new Map<string, FileGroupEntry>();
        let cancelled = false;

        setFiles([]);
        setStatus("loading");

        async function run() {
            try {
                const res = await fetch(
                    `/api/gameevents/modules?game=${gameId}`,
                );
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

                        let group = byFile.get(msg.file);
                        if (!group) {
                            group = { file: msg.file, items: [] };
                            byFile.set(msg.file, group);
                            order.push(msg.file);
                        }
                        if (msg.type === "item") {
                            group.items.push({ name: msg.name });
                        }
                    }

                    if (!cancelled) {
                        setFiles(
                            order.map((file) => {
                                const group = byFile.get(file)!;
                                return { file, items: [...group.items] };
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

    const isOpen = (file: string) => openFiles.has(file);

    const toggleFile = (file: string) => {
        setOpenFiles((prev) => {
            const next = new Set(prev);
            if (next.has(file)) next.delete(file);
            else next.add(file);
            return next;
        });
    };

    const rows = useMemo<Row[]>(() => {
        const result: Row[] = [];
        for (const group of files) {
            result.push({
                type: "header",
                file: group.file,
                count: group.items.length,
            });
            if (isOpen(group.file)) {
                for (const item of group.items) {
                    result.push({
                        type: "item",
                        file: group.file,
                        name: item.name,
                    });
                }
            }
        }
        return result;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [files, openFiles]);

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
            <div
                ref={scrollRef}
                className="max-h-[calc(100vh-11rem)] overflow-y-auto"
            >
                {status === "error" && (
                    <p className="px-4 py-6 text-center font-mono text-xs text-zinc-600">
                        Game event data is temporarily unavailable.
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
                                        onClick={() => toggleFile(row.file)}
                                        aria-expanded={isOpen(row.file)}
                                        style={style}
                                        className="flex items-center justify-between border-t border-white/5 px-4 text-left transition-colors first:border-t-0 hover:bg-white/[0.03]"
                                    >
                                        <span className="truncate font-mono text-sm text-white">
                                            {row.file}
                                        </span>
                                        <span className="shrink-0 font-mono text-xs text-zinc-500">
                                            {row.count}
                                        </span>
                                    </button>
                                );
                            }

                            return (
                                <Link
                                    key={virtualRow.key}
                                    href={`/gameevents-viewer/${gameId}/${encodeURIComponent(row.name)}`}
                                    style={style}
                                    className="flex items-center gap-2 px-4 font-mono text-xs text-zinc-400 transition-colors hover:bg-white/[0.03] hover:text-accent"
                                >
                                    <span className="text-accent">E</span>
                                    <span className="min-w-0 flex-1 truncate">
                                        {row.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
