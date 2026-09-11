import { notFound } from "next/navigation";
import Link from "next/link";
import { History } from "lucide-react";
import { GAMES, getGame } from "@/lib/schema/games";
import { GameSwitcher } from "@/components/schema/game-switcher";
import { PanoramaSidebar } from "@/components/panorama/panorama-sidebar";
import { PanoramaSearchResults } from "@/components/panorama/panorama-search-results";
import { ViewerSearchProvider } from "@/components/search/viewer-search-context";
import { ViewerSearchBar } from "@/components/search/viewer-search-bar";

export default async function PanoramaGameLayout(
    props: LayoutProps<"/panorama-viewer/[game]">,
) {
    const { game: gameId } = await props.params;
    const game = getGame(gameId);
    if (!game) {
        notFound();
    }

    return (
        <ViewerSearchProvider>
            <div className="mt-6 flex flex-wrap items-center gap-3">
                <GameSwitcher
                    games={GAMES}
                    current={game}
                    basePath="/panorama-viewer"
                />
                <Link
                    href={`/panorama-viewer/${gameId}/versions`}
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
                >
                    <History className="h-4 w-4 text-zinc-500" />
                    versions
                </Link>
                <ViewerSearchBar
                    viewerId="panorama"
                    gameId={gameId}
                    placeholder="grep property name"
                    resultsSlot={<PanoramaSearchResults gameId={gameId} />}
                />
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
                <PanoramaSidebar gameId={gameId} />

                <div className="min-w-0">{props.children}</div>
            </div>
        </ViewerSearchProvider>
    );
}
