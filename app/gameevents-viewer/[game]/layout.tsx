import { notFound } from "next/navigation";
import Link from "next/link";
import { History } from "lucide-react";
import { GAMES, getGame } from "@/lib/schema/games";
import { GameSwitcher } from "@/components/schema/game-switcher";
import { GameEventsSidebar } from "@/components/gameevents/gameevents-sidebar";
import { GameEventsLanguageProvider } from "@/components/gameevents/language-context";
import { GameEventsLanguageSwitcher } from "@/components/gameevents/language-switcher";

export default async function GameEventsGameLayout(
    props: LayoutProps<"/gameevents-viewer/[game]">,
) {
    const { game: gameId } = await props.params;
    const game = getGame(gameId);
    if (!game) {
        notFound();
    }

    return (
        <GameEventsLanguageProvider>
            <div className="mt-6 flex flex-wrap items-center gap-3">
                <GameSwitcher games={GAMES} current={game} />
                <GameEventsLanguageSwitcher />
                <Link
                    href={`/gameevents-viewer/${gameId}/versions`}
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
                >
                    <History className="h-4 w-4 text-zinc-500" />
                    versions
                </Link>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
                <GameEventsSidebar gameId={gameId} />

                <div className="min-w-0">{props.children}</div>
            </div>
        </GameEventsLanguageProvider>
    );
}
