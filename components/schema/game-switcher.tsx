"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { Game } from "@/lib/schema/games";

export function GameSwitcher({
    games,
    current,
}: {
    games: Game[];
    current: Game;
}) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative inline-block">
            <button
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white transition-colors hover:border-white/20"
            >
                <Image
                    src={current.icon}
                    alt=""
                    width={20}
                    height={20}
                    className="rounded"
                />
                {current.name}
                <ChevronDown
                    className={`h-3.5 w-3.5 text-zinc-500 transition-transform ${
                        open ? "rotate-180" : ""
                    }`}
                />
            </button>

            {open && (
                <>
                    <button
                        aria-hidden
                        tabIndex={-1}
                        onClick={() => setOpen(false)}
                        className="fixed inset-0 z-10 cursor-default"
                    />
                    <div className="absolute left-0 top-full z-20 mt-2 min-w-full overflow-hidden rounded-lg border border-white/10 bg-zinc-950 shadow-xl">
                        {games.map((game) => (
                            <Link
                                key={game.id}
                                href={`/schema-viewer/${game.id}`}
                                onClick={() => setOpen(false)}
                                className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 font-mono text-sm transition-colors hover:bg-white/[0.03] ${
                                    game.id === current.id
                                        ? "text-accent"
                                        : "text-zinc-300"
                                }`}
                            >
                                <Image
                                    src={game.icon}
                                    alt=""
                                    width={18}
                                    height={18}
                                    className="rounded"
                                />
                                {game.name}
                            </Link>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
