"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useVirtualizer } from "@tanstack/react-virtual";

type StreamMessage = { name: string };
type Status = "loading" | "done" | "error";

const ITEM_ROW_HEIGHT = 30;

export function EntitiesSidebar({ gameId }: { gameId: string }) {
    const [names, setNames] = useState<string[]>([]);
    const [status, setStatus] = useState<Status>("loading");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const collected: string[] = [];
        let cancelled = false;

        setNames([]);
        setStatus("loading");

        async function run() {
            try {
                const res = await fetch(`/api/entities/list?game=${gameId}`);
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
                        collected.push(msg.name);
                    }

                    if (!cancelled) setNames([...collected]);
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

    // eslint-disable-next-line react-hooks/incompatible-library
    const virtualizer = useVirtualizer({
        count: names.length,
        getScrollElement: () => scrollRef.current,
        estimateSize: () => ITEM_ROW_HEIGHT,
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
                        Entity data is temporarily unavailable.
                    </p>
                )}

                {status === "done" && names.length === 0 && (
                    <p className="px-4 py-6 text-center font-mono text-xs text-zinc-600">
                        No matches.
                    </p>
                )}

                {names.length > 0 && (
                    <div
                        style={{
                            height: virtualizer.getTotalSize(),
                            position: "relative",
                        }}
                    >
                        {virtualizer.getVirtualItems().map((virtualRow) => {
                            const name = names[virtualRow.index];
                            const style = {
                                position: "absolute" as const,
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: virtualRow.size,
                                transform: `translateY(${virtualRow.start}px)`,
                            };
                            return (
                                <Link
                                    key={virtualRow.key}
                                    href={`/entity-viewer/${gameId}/${encodeURIComponent(name)}`}
                                    style={style}
                                    className="flex items-center gap-2 px-4 font-mono text-xs text-zinc-400 transition-colors hover:bg-white/[0.03] hover:text-accent"
                                >
                                    <span className="text-accent">E</span>
                                    <span className="truncate">{name}</span>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
