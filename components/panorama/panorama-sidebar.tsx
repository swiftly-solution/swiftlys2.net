"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useVirtualizer } from "@tanstack/react-virtual";

type Status = "loading" | "done" | "error";

const ITEM_ROW_HEIGHT = 30;

export function PanoramaSidebar({ gameId }: { gameId: string }) {
    const [names, setNames] = useState<string[]>([]);
    const [status, setStatus] = useState<Status>("loading");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let cancelled = false;
        setNames([]);
        setStatus("loading");

        fetch(`/api/panorama/list?game=${gameId}`)
            .then((res) => {
                if (!res.ok) throw new Error("bad response");
                return res.json();
            })
            .then((data: string[]) => {
                if (!cancelled) {
                    setNames(data);
                    setStatus("done");
                }
            })
            .catch(() => {
                if (!cancelled) setStatus("error");
            });

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
                    <p className="px-4 py-6 text-center font-mono text-xs text-zinc-400">
                        Panorama data is temporarily unavailable.
                    </p>
                )}

                {status === "done" && names.length === 0 && (
                    <p className="px-4 py-6 text-center font-mono text-xs text-zinc-400">
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
                            return (
                                <Link
                                    key={virtualRow.key}
                                    href={`/panorama-viewer/${gameId}/${encodeURIComponent(name)}`}
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        height: virtualRow.size,
                                        transform: `translateY(${virtualRow.start}px)`,
                                    }}
                                    className="flex items-center gap-2 px-4 font-mono text-xs text-zinc-400 transition-colors hover:bg-white/[0.03] hover:text-accent"
                                >
                                    <span className="text-accent">P</span>
                                    <span className="min-w-0 flex-1 truncate">
                                        {name}
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
