"use client";

import { Hash, Boxes } from "lucide-react";
import { SchemaBreadcrumb } from "@/components/schema/breadcrumb";
import { useProtobufLanguage } from "@/components/protobuf/language-context";
import type { ProtobufEnumResponse } from "@/lib/protobuf/api-types";

export function EnumDetail({
    data,
    gameId,
}: {
    data: ProtobufEnumResponse;
    gameId: string;
}) {
    const { language } = useProtobufLanguage();
    const displayName = language === "csharp" ? data.csharpName : data.name;

    return (
        <div>
            <SchemaBreadcrumb
                gameId={gameId}
                project={data.file}
                name={data.name}
                displayName={displayName}
                basePath="/protobuf-viewer"
            />

            <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-6">
                <div className="flex flex-wrap items-center gap-3">
                    <Hash className="h-5 w-5 shrink-0 text-amber-400" />
                    <h2 className="font-mono text-2xl font-bold text-white">
                        {displayName}
                    </h2>
                    <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-zinc-500">
                        enum
                    </span>
                </div>

                <div className="mt-6 grid grid-cols-2 divide-x divide-white/10 rounded-xl border border-white/10">
                    <div className="px-4 py-3 text-center">
                        <div className="font-mono text-xl font-bold text-white">
                            {data.values.length}
                        </div>
                        <div className="mt-1 font-mono text-xs text-zinc-500">
                            values
                        </div>
                    </div>
                    <div className="px-4 py-3 text-center">
                        <div className="font-mono text-xl font-bold text-white">
                            {data.modules.length}
                        </div>
                        <div className="mt-1 font-mono text-xs text-zinc-500">
                            modules
                        </div>
                    </div>
                </div>

                {data.modules.length > 0 && (
                    <div className="mt-6">
                        <div className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                            Found in modules
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5 font-mono text-xs">
                            {data.modules.map((mod) => (
                                <span
                                    key={mod}
                                    className="flex items-center gap-1 rounded border border-white/10 bg-black/20 px-2 py-1 text-zinc-300"
                                >
                                    <Boxes className="h-3 w-3 text-zinc-600" />
                                    {mod}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-6 space-y-1.5">
                    {data.values.map((value) => (
                        <div
                            key={value.name}
                            className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-black/20 px-4 py-3 font-mono text-sm"
                        >
                            <span className="font-semibold text-white">
                                {value.name}
                            </span>
                            <span className="shrink-0 text-xs text-zinc-500">
                                {value.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
