import { Terminal } from "lucide-react";
import { SchemaBreadcrumb } from "@/components/schema/breadcrumb";
import { ConvarsFilterChip } from "@/components/convars/convars-filter-chip";
import type { ConCommand } from "@/lib/convars/types";

const ATTRIBUTE_LABELS: Record<keyof ConCommand["attributes"], string> = {
    has_callback: "callback",
    has_completion_callback: "completion callback",
};

export function ConcommandDetail({
    data,
    gameId,
}: {
    data: ConCommand;
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
                    <Terminal className="h-5 w-5 shrink-0 text-amber-400" />
                    <h2 className="font-mono text-2xl font-bold text-white">
                        {data.name}
                    </h2>
                    <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-zinc-500">
                        concommand
                    </span>
                </div>

                {data.description && (
                    <p className="mt-4 text-sm text-zinc-400">
                        {data.description}
                    </p>
                )}

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
                                keyof ConCommand["attributes"]
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
