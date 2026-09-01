import { notFound } from "next/navigation";
import { getBaseUrl } from "@/lib/base-url";
import { getGame } from "@/lib/schema/games";
import { EntityDetail } from "@/components/entities/entity-detail";
import type { EntityEntryResponse } from "@/lib/entities/types";

function decodeSegment(value: string): string {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

export default async function EntityEntryPage(
    props: PageProps<"/entity-viewer/[game]/[className]">,
) {
    const { game: gameId, className: rawClassName } = await props.params;
    const className = decodeSegment(rawClassName);
    if (!getGame(gameId)) {
        notFound();
    }

    const baseUrl = await getBaseUrl();
    const res = await fetch(
        `${baseUrl}/api/entities/entry?game=${gameId}&className=${encodeURIComponent(className)}`,
    );

    if (res.status === 404) {
        notFound();
    }
    if (!res.ok) {
        throw new Error(`Entity entry fetch failed: ${res.status}`);
    }

    const data: EntityEntryResponse = await res.json();
    return <EntityDetail data={data} gameId={gameId} />;
}
