import { NextResponse, type NextRequest } from "next/server";
import { getProtobufDump } from "@/lib/protobuf/dump";
import { computeNetMessageIds } from "@/lib/protobuf/csharp";
import { getGame } from "@/lib/schema/games";

const MAX_RESULTS = 100;

export type ProtobufSearchResult = {
    file: string;
    modules: string[];
    name: string;
    kind: "message" | "enum";
    matchedField?: string;
    messageId?: number;
};

export async function GET(request: NextRequest) {
    const gameId = request.nextUrl.searchParams.get("game");
    const q = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";
    const kindParamRaw = request.nextUrl.searchParams.get("kind");
    const kindParam =
        kindParamRaw === "message" || kindParamRaw === "enum"
            ? kindParamRaw
            : null;
    const fileParam =
        request.nextUrl.searchParams.get("file")?.trim().toLowerCase() ?? "";
    const moduleParam =
        request.nextUrl.searchParams.get("module")?.trim().toLowerCase() ?? "";

    if (!gameId || !getGame(gameId)) {
        return NextResponse.json({ error: "unknown game" }, { status: 400 });
    }
    if (!q && !kindParam && !fileParam && !moduleParam) {
        return NextResponse.json([]);
    }

    let dump;
    try {
        dump = await getProtobufDump(gameId);
    } catch {
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }

    const results: ProtobufSearchResult[] = [];
    const isNumericQuery = /^\d+$/.test(q);

    outer: for (const file of dump.files) {
        if (fileParam && !file.fileName.toLowerCase().includes(fileParam)) {
            continue;
        }
        if (
            moduleParam &&
            !file.modules.some((m) => m.toLowerCase() === moduleParam)
        ) {
            continue;
        }

        const netMessageIds = isNumericQuery
            ? computeNetMessageIds(file)
            : null;

        if (!kindParam || kindParam === "message") {
            for (const message of file.messages) {
                if (results.length >= MAX_RESULTS) break outer;

                if (!q) {
                    results.push({
                        file: file.fileName,
                        modules: file.modules,
                        name: message.name,
                        kind: "message",
                    });
                    continue;
                }

                if (message.name.toLowerCase().includes(q)) {
                    results.push({
                        file: file.fileName,
                        modules: file.modules,
                        name: message.name,
                        kind: "message",
                        messageId: netMessageIds?.get(message.name),
                    });
                    continue;
                }

                if (netMessageIds) {
                    const id = netMessageIds.get(message.name);
                    if (id !== undefined && String(id).includes(q)) {
                        results.push({
                            file: file.fileName,
                            modules: file.modules,
                            name: message.name,
                            kind: "message",
                            messageId: id,
                        });
                        continue;
                    }
                }

                const matchedField = message.fields.find((f) =>
                    f.name.toLowerCase().includes(q),
                );
                if (matchedField) {
                    results.push({
                        file: file.fileName,
                        modules: file.modules,
                        name: message.name,
                        kind: "message",
                        matchedField: matchedField.name,
                    });
                }
            }
        }

        if (!kindParam || kindParam === "enum") {
            for (const protoEnum of file.enums) {
                if (results.length >= MAX_RESULTS) break outer;

                if (!q || protoEnum.name.toLowerCase().includes(q)) {
                    results.push({
                        file: file.fileName,
                        modules: file.modules,
                        name: protoEnum.name,
                        kind: "enum",
                    });
                }
            }
        }
    }

    return NextResponse.json(results.slice(0, MAX_RESULTS));
}
