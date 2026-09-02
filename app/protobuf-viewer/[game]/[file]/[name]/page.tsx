import { notFound } from "next/navigation";
import { getBaseUrl } from "@/lib/base-url";
import { getGame } from "@/lib/schema/games";
import { MessageDetail } from "@/components/protobuf/message-detail";
import { EnumDetail } from "@/components/protobuf/enum-detail";
import type { ProtobufEntryResponse } from "@/lib/protobuf/api-types";

function decodeSegment(value: string): string {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

export default async function ProtobufEntryPage(
    props: PageProps<"/protobuf-viewer/[game]/[file]/[name]">,
) {
    const { game: gameId, file: rawFile, name: rawName } = await props.params;
    const file = decodeSegment(rawFile);
    const name = decodeSegment(rawName);
    if (!getGame(gameId)) {
        notFound();
    }

    const baseUrl = await getBaseUrl();
    const res = await fetch(
        `${baseUrl}/api/protobuf/entry?game=${gameId}&file=${encodeURIComponent(file)}&name=${encodeURIComponent(name)}`,
    );

    if (res.status === 404) {
        notFound();
    }
    if (!res.ok) {
        throw new Error(`Protobuf entry fetch failed: ${res.status}`);
    }

    const data: ProtobufEntryResponse = await res.json();

    if (data.kind === "message") {
        return <MessageDetail data={data} gameId={gameId} />;
    }
    return <EnumDetail data={data} gameId={gameId} />;
}
