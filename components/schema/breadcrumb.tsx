import Link from "next/link";
import { getGame } from "@/lib/schema/games";

export function SchemaBreadcrumb({
    gameId,
    project,
    name,
    displayName,
}: {
    gameId: string;
    project: string;
    name: string;
    displayName?: string;
}) {
    const gameName = getGame(gameId)?.name ?? gameId;

    return (
        <div className="mb-4 flex flex-wrap items-center gap-2 font-mono text-xs text-zinc-500">
            <Link
                href={`/schema-viewer/${gameId}`}
                className="hover:text-white"
            >
                {gameName}
            </Link>
            <span className="text-zinc-700">&rsaquo;</span>
            <span>{project}</span>
            <span className="text-zinc-700">&rsaquo;</span>
            <span className="text-zinc-300">{displayName ?? name}</span>
        </div>
    );
}
