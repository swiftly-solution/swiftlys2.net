import { notFound } from "next/navigation";
import { GAMES, getGame } from "@/lib/schema/games";
import { GameSwitcher } from "@/components/schema/game-switcher";
import { ProtobufSidebar } from "@/components/protobuf/protobuf-sidebar";
import { ProtobufLanguageProvider } from "@/components/protobuf/language-context";
import { ProtobufLanguageSwitcher } from "@/components/protobuf/language-switcher";

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
            <div className="mt-6 flex flex-wrap items-center gap-3">
                <GameSwitcher games={GAMES} current={game} />
                <ProtobufLanguageSwitcher />
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
                <ProtobufSidebar gameId={gameId} />

                <div className="min-w-0">{props.children}</div>
            </div>
        </ProtobufLanguageProvider>
    );
}
