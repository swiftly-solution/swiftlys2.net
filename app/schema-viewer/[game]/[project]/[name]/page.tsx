import { notFound } from "next/navigation";
import { getBaseUrl } from "@/lib/base-url";
import { getGame } from "@/lib/schema/games";
import { ClassDetail } from "@/components/schema/class-detail";
import { EnumDetail } from "@/components/schema/enum-detail";
import type { EntryResponse } from "@/lib/schema/api-types";

function decodeSegment(value: string): string {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

export default async function SchemaEntryPage(
    props: PageProps<"/schema-viewer/[game]/[project]/[name]">,
) {
    const {
        game: gameId,
        project: rawProject,
        name: rawName,
    } = await props.params;
    const project = decodeSegment(rawProject);
    const name = decodeSegment(rawName);
    if (!getGame(gameId)) {
        notFound();
    }

    const baseUrl = await getBaseUrl();
    const res = await fetch(
        `${baseUrl}/api/schema/entry?game=${gameId}&project=${encodeURIComponent(project)}&name=${encodeURIComponent(name)}`,
    );

    if (res.status === 404) {
        notFound();
    }
    if (!res.ok) {
        throw new Error(`Schema entry fetch failed: ${res.status}`);
    }

    const data: EntryResponse = await res.json();

    if (data.kind === "class") {
        return <ClassDetail data={data} gameId={gameId} />;
    }
    return <EnumDetail data={data} gameId={gameId} />;
}
