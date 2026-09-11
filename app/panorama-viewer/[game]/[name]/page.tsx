import { notFound } from "next/navigation";
import { getBaseUrl } from "@/lib/base-url";
import { getGame } from "@/lib/schema/games";
import { PropertyDetail } from "@/components/panorama/property-detail";
import type { PanoramaEntryResponse } from "@/app/api/panorama/entry/route";

function decodeSegment(value: string): string {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

export default async function PanoramaEntryPage(
    props: PageProps<"/panorama-viewer/[game]/[name]">,
) {
    const { game: gameId, name: rawName } = await props.params;
    const name = decodeSegment(rawName);
    if (!getGame(gameId)) {
        notFound();
    }

    const baseUrl = await getBaseUrl();
    const res = await fetch(
        `${baseUrl}/api/panorama/entry?game=${gameId}&name=${encodeURIComponent(name)}`,
    );

    if (res.status === 404) {
        notFound();
    }
    if (!res.ok) {
        throw new Error(`Panorama entry fetch failed: ${res.status}`);
    }

    const data: PanoramaEntryResponse = await res.json();

    return <PropertyDetail data={data} gameId={gameId} />;
}
