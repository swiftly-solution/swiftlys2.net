import { Settings2 } from "lucide-react";
import { SchemaBreadcrumb } from "@/components/schema/breadcrumb";
import { ConvarsFilterChip } from "@/components/convars/convars-filter-chip";
import type { ConVar } from "@/lib/convars/types";

const ATTRIBUTE_LABELS: Record<keyof ConVar["attributes"], string> = {
    has_callback: "callback",
    has_default: "default",
    has_max: "max",
    has_min: "min",
};

export function ConvarDetail({
    data,
    gameId,
}: {
    data: ConVar;
    gameId: string;
}) {
    return (
        <div>
            <SchemaBreadcrumb
                gameId={gameId}
                project={data.module}
                name={data.name}
                basePath="/convars-viewer"
            />

            <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-6">
                <div className="flex flex-wrap items-center gap-3">
                    <Settings2 className="h-5 w-5 shrink-0 text-accent" />
                    <h2 className="font-mono text-2xl font-bold text-white">
                        {data.name}
                    </h2>
                    <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-zinc-500">
                        convar
                    </span>
                </div>

                {data.description && (
                    <p className="mt-4 text-sm text-zinc-400">
                        {data.description}
                    </p>
                )}

                <div className="mt-6 grid grid-cols-3 divide-x divide-white/10 rounded-xl border border-white/10">
                    <div className="px-4 py-3 text-center">
                        <div className="font-mono text-xl font-bold text-white">
                            {data.default ?? "-"}
                        </div>
                        <div className="mt-1 font-mono text-xs text-zinc-500">
                            default
                        </div>
                    </div>
                    <div className="px-4 py-3 text-center">
                        <div className="font-mono text-xl font-bold text-white">
                            {data.min ?? "-"}
                        </div>
                        <div className="mt-1 font-mono text-xs text-zinc-500">
                            min
                        </div>
                    </div>
                    <div className="px-4 py-3 text-center">
                        <div className="font-mono text-xl font-bold text-white">
                            {data.max ?? "-"}
                        </div>
                        <div className="mt-1 font-mono text-xs text-zinc-500">
                            max
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <div className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                        Flags
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {data.flags.length === 0 && (
                            <span className="font-mono text-xs text-zinc-600">
                                none
                            </span>
                        )}
                        {data.flags.map((flag) => (
                            <ConvarsFilterChip
                                key={flag}
                                facet="flags"
                                value={flag}
                                label={flag}
                            />
                        ))}
                    </div>
                </div>

                <div className="mt-6">
                    <div className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                        Attributes
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {(
                            Object.keys(ATTRIBUTE_LABELS) as Array<
                                keyof ConVar["attributes"]
                            >
                        ).map((key) =>
                            data.attributes[key] ? (
                                <ConvarsFilterChip
                                    key={key}
                                    facet="attrs"
                                    value={key}
                                    label={ATTRIBUTE_LABELS[key]}
                                />
                            ) : (
                                <span
                                    key={key}
                                    className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-zinc-600"
                                >
                                    {ATTRIBUTE_LABELS[key]}
                                </span>
                            ),
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
