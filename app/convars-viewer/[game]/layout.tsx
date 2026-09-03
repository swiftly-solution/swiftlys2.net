import { notFound } from "next/navigation";
import Link from "next/link";
import { History } from "lucide-react";
import { GAMES, getGame } from "@/lib/schema/games";
import { GameSwitcher } from "@/components/schema/game-switcher";
import { ConvarsSidebar } from "@/components/convars/convars-sidebar";
import {
    ConvarsFilterProvider,
    ConvarsFilterButton,
} from "@/components/convars/filter-context";

export default async function ConvarsGameLayout(
    props: LayoutProps<"/convars-viewer/[game]">,
) {
    const { game: gameId } = await props.params;
    const game = getGame(gameId);
    if (!game) {
        notFound();
    }

    return (
        <ConvarsFilterProvider gameId={gameId}>
            <div className="mt-6 flex flex-wrap items-center gap-3">
                <GameSwitcher
                    games={GAMES}
                    current={game}
                    basePath="/convars-viewer"
                />
                <Link
                    href={`/convars-viewer/${gameId}/versions`}
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
                >
                    <History className="h-4 w-4 text-zinc-500" />
                    versions
                </Link>
                <ConvarsFilterButton />
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
                <ConvarsSidebar gameId={gameId} />

                <div className="min-w-0">{props.children}</div>
            </div>
        </ConvarsFilterProvider>
    );
}
