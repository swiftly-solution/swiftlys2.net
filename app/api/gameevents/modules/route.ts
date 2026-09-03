import { type NextRequest } from "next/server";
import { getGameEventsDump } from "@/lib/gameevents/dump";
import { buildGameEventFileIndex } from "@/lib/gameevents/queries";
import { getGame } from "@/lib/schema/games";

export async function GET(request: NextRequest) {
    const gameId = request.nextUrl.searchParams.get("game");
    if (!gameId || !getGame(gameId)) {
        return new Response(JSON.stringify({ error: "unknown game" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    let files;
    try {
        const dump = await getGameEventsDump(gameId);
        files = buildGameEventFileIndex(dump);
    } catch {
        return new Response(JSON.stringify({ error: "unavailable" }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
        });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        start(controller) {
            for (const group of files) {
                controller.enqueue(
                    encoder.encode(
                        `${JSON.stringify({ type: "module", file: group.file, count: group.items.length })}\n`,
                    ),
                );
                for (const item of group.items) {
                    controller.enqueue(
                        encoder.encode(
                            `${JSON.stringify({
                                type: "item",
                                file: group.file,
                                name: item.name,
                                fieldCount: item.fieldCount,
                            })}\n`,
                        ),
                    );
                }
            }
            controller.close();
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "application/x-ndjson; charset=utf-8",
            "X-Content-Type-Options": "nosniff",
        },
    });
}
