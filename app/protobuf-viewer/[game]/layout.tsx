import { notFound } from "next/navigation";
import Link from "next/link";
import { History } from "lucide-react";
import { GAMES, getGame } from "@/lib/schema/games";
import { GameSwitcher } from "@/components/schema/game-switcher";
import { ProtobufSidebar } from "@/components/protobuf/protobuf-sidebar";
import { ProtobufSearchResults } from "@/components/protobuf/protobuf-search-results";
import { ProtobufLanguageProvider } from "@/components/protobuf/language-context";
import { ProtobufLanguageSwitcher } from "@/components/protobuf/language-switcher";
import { ViewerSearchProvider } from "@/components/search/viewer-search-context";
import { ViewerSearchBar } from "@/components/search/viewer-search-bar";

export default async function ProtobufGameLayout(
    props: LayoutProps<"/protobuf-viewer/[game]">,
) {
    const { game: gameId } = await props.params;
    const game = getGame(gameId);
    if (!game) {
        notFound();
    }

    return (
        <ProtobufLanguageProvider>
            <ViewerSearchProvider>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                    <GameSwitcher games={GAMES} current={game} />
                    <ProtobufLanguageSwitcher />
                    <Link
                        href={`/protobuf-viewer/${gameId}/versions`}
                        className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
                    >
                        <History className="h-4 w-4 text-zinc-500" />
                        versions
                    </Link>
                    <ViewerSearchBar
                        viewerId="protobuf"
                        gameId={gameId}
                        placeholder="grep message, enum, field or message id"
                        resultsSlot={<ProtobufSearchResults gameId={gameId} />}
                    />
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
                    <ProtobufSidebar gameId={gameId} />

                    <div className="min-w-0">{props.children}</div>
                </div>
            </ViewerSearchProvider>
        </ProtobufLanguageProvider>
    );
}
