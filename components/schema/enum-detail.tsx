"use client";

import { Hash } from "lucide-react";
import { SchemaBreadcrumb } from "@/components/schema/breadcrumb";
import { ReferencedBy } from "@/components/schema/referenced-by";
import { useSchemaLanguage } from "@/components/schema/language-context";
import type { EnumEntryResponse } from "@/lib/schema/api-types";

export function EnumDetail({
    data,
    gameId,
}: {
    data: EnumEntryResponse;
    gameId: string;
}) {
    const { language } = useSchemaLanguage();
    const displayName = language === "csharp" ? data.csharpName : data.name;

    return (
        <div>
            <SchemaBreadcrumb
                gameId={gameId}
                project={data.project}
                name={data.name}
                displayName={displayName}
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

                <div className="mt-6 grid grid-cols-3 divide-x divide-white/10 rounded-xl border border-white/10">
                    <div className="px-4 py-3 text-center">
                        <div className="font-mono text-xl font-bold text-white">
                            {data.size}
                        </div>
                        <div className="mt-1 font-mono text-xs text-zinc-500">
                            size
                        </div>
                    </div>
                    <div className="px-4 py-3 text-center">
                        <div className="font-mono text-xl font-bold text-white">
                            {data.alignment}
                        </div>
                        <div className="mt-1 font-mono text-xs text-zinc-500">
                            alignment
                        </div>
                    </div>
                    <div className="px-4 py-3 text-center">
                        <div className="font-mono text-xl font-bold text-white">
                            {data.members.length}
                        </div>
                        <div className="mt-1 font-mono text-xs text-zinc-500">
                            members
                        </div>
                    </div>
                </div>

                <div className="mt-6 space-y-1.5">
                    {data.members.map((member) => (
                        <div
                            key={member.name}
                            className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-black/20 px-4 py-3 font-mono text-sm"
                        >
                            <span className="font-semibold text-white">
                                {member.name}
                            </span>
                            <span className="shrink-0 text-xs text-zinc-500">
                                {member.value}
                            </span>
                        </div>
                    ))}
                </div>

                <ReferencedBy references={data.references} gameId={gameId} />
            </div>
        </div>
    );
}
