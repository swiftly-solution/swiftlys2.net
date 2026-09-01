import { notFound } from "next/navigation";
import { getBaseUrl } from "@/lib/base-url";
import { getGame } from "@/lib/schema/games";
import { ConvarDetail } from "@/components/convars/convar-detail";
import { ConcommandDetail } from "@/components/convars/concommand-detail";
import type { ConvarsEntryResponse } from "@/lib/convars/types";

function decodeSegment(value: string): string {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

export default async function ConvarsEntryPage(
    props: PageProps<"/convars-viewer/[game]/[module]/[name]">,
) {
    const {
        game: gameId,
        module: rawModule,
        name: rawName,
    } = await props.params;
    const moduleName = decodeSegment(rawModule);
    const name = decodeSegment(rawName);
    if (!getGame(gameId)) {
        notFound();
    }

    const baseUrl = await getBaseUrl();
    const res = await fetch(
        `${baseUrl}/api/convars/entry?game=${gameId}&module=${encodeURIComponent(moduleName)}&name=${encodeURIComponent(name)}`,
    );

    if (res.status === 404) {
        notFound();
    }
    if (!res.ok) {
        throw new Error(`ConVar entry fetch failed: ${res.status}`);
    }

    const data: ConvarsEntryResponse = await res.json();

    if (data.kind === "convar") {
        return <ConvarDetail data={data} gameId={gameId} />;
    }
    return <ConcommandDetail data={data} gameId={gameId} />;
}
