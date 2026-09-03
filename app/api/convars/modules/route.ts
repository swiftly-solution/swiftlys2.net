import { type NextRequest } from "next/server";
import { getConvarsDump } from "@/lib/convars/dump";
import { buildConvarsModuleIndex } from "@/lib/convars/queries";
import { getGame } from "@/lib/schema/games";

export async function GET(request: NextRequest) {
    const gameId = request.nextUrl.searchParams.get("game");
    if (!gameId || !getGame(gameId)) {
        return new Response(JSON.stringify({ error: "unknown game" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    let modules;
    try {
        const dump = await getConvarsDump(gameId);
        modules = buildConvarsModuleIndex(dump);
    } catch {
        return new Response(JSON.stringify({ error: "unavailable" }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
        });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        start(controller) {
            for (const mod of modules) {
                controller.enqueue(
                    encoder.encode(
                        `${JSON.stringify({ type: "module", module: mod.module, count: mod.items.length })}\n`,
                    ),
                );
                for (const item of mod.items) {
                    controller.enqueue(
                        encoder.encode(
                            `${JSON.stringify({
                                type: "item",
                                module: mod.module,
                                name: item.name,
                                kind: item.kind,
                                flags: item.flags,
                                attrs: item.attrs,
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
