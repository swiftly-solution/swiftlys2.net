import { Paintbrush } from "lucide-react";
import { SchemaBreadcrumb } from "@/components/schema/breadcrumb";
import { renderPanoramaDescription } from "@/lib/panorama/render";
import type { PanoramaEntryResponse } from "@/app/api/panorama/entry/route";

export function PropertyDetail({
    data,
    gameId,
}: {
    data: PanoramaEntryResponse;
    gameId: string;
}) {
    const hasDescription = data.description.trim().length > 0;

    return (
        <div>
            <SchemaBreadcrumb
                gameId={gameId}
                name={data.name}
                basePath="/panorama-viewer"
            />

            <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-6">
                <div className="flex flex-wrap items-center gap-3">
                    <Paintbrush className="h-5 w-5 shrink-0 text-accent" />
                    <h2 className="font-mono text-2xl font-bold text-white">
                        {data.name}
                    </h2>
                    <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-zinc-500">
                        property
                    </span>
                </div>

                <div className="mt-6 text-sm leading-relaxed text-zinc-300">
                    {hasDescription ? (
                        renderPanoramaDescription(data.description)
                    ) : (
                        <span className="text-zinc-500">
                            No description available.
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
