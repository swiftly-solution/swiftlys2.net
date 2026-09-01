import { notFound } from "next/navigation";
import Link from "next/link";
import { History } from "lucide-react";
import { GAMES, getGame } from "@/lib/schema/games";
import { GameSwitcher } from "@/components/schema/game-switcher";
import { LanguageProvider } from "@/components/schema/language-context";
import { LanguageSwitcher } from "@/components/schema/language-switcher";
import { EntitiesSidebar } from "@/components/entities/entities-sidebar";

export default async function EntityGameLayout(
    props: LayoutProps<"/entity-viewer/[game]">,
) {
    const { game: gameId } = await props.params;
    const game = getGame(gameId);
    if (!game) {
        notFound();
    }

    return (
        <LanguageProvider>
            <div className="mt-6 flex flex-wrap items-center gap-3">
                <GameSwitcher
                    games={GAMES}
                    current={game}
                    basePath="/entity-viewer"
                />
                <LanguageSwitcher />
                <Link
                    href={`/entity-viewer/${gameId}/versions`}
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
                >
                    <History className="h-4 w-4 text-zinc-500" />
                    versions
                </Link>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
                <EntitiesSidebar gameId={gameId} />

                <div className="min-w-0">{props.children}</div>
            </div>
        </LanguageProvider>
    );
}
