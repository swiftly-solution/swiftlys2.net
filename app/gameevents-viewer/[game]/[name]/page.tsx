import { notFound } from "next/navigation";
import { getBaseUrl } from "@/lib/base-url";
import { getGame } from "@/lib/schema/games";
import { EventDetail } from "@/components/gameevents/event-detail";
import type { GameEventResponse } from "@/lib/gameevents/api-types";

function decodeSegment(value: string): string {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

export default async function GameEventEntryPage(
    props: PageProps<"/gameevents-viewer/[game]/[name]">,
) {
    const { game: gameId, name: rawName } = await props.params;
    const name = decodeSegment(rawName);
    if (!getGame(gameId)) {
        notFound();
    }

    const baseUrl = await getBaseUrl();
    const res = await fetch(
        `${baseUrl}/api/gameevents/entry?game=${gameId}&name=${encodeURIComponent(name)}`,
    );

    if (res.status === 404) {
        notFound();
    }
    if (!res.ok) {
        throw new Error(`Game event entry fetch failed: ${res.status}`);
    }

    const data: GameEventResponse = await res.json();

    return <EventDetail data={data} gameId={gameId} />;
}
