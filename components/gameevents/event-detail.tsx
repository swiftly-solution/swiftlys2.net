"use client";

import { Zap, FileText } from "lucide-react";
import { SchemaBreadcrumb } from "@/components/schema/breadcrumb";
import { useGameEventsLanguage } from "@/components/gameevents/language-context";
import type { GameEventResponse } from "@/lib/gameevents/api-types";
import type { CSharpEventProperty } from "@/lib/gameevents/csharp";

type FieldRow = { name: string; type: string; comment?: string };

function flattenCSharpProperties(props: CSharpEventProperty[]): FieldRow[] {
    const rows: FieldRow[] = [];
    for (const p of props) {
        if (p.kind === "player") {
            rows.push({ name: p.controllerName, type: "CCSPlayerController" });
            rows.push({ name: p.pawnName, type: "CCSPlayerPawn" });
            rows.push({ name: p.playerName, type: "IPlayer?" });
            rows.push({ name: p.rawName, type: "int" });
        } else {
            rows.push({
                name: p.name,
                type: p.csType,
                comment: p.isActualOf
                    ? `actual value of ${p.isActualOf}`
                    : undefined,
            });
        }
    }
    return rows;
}

export function EventDetail({
    data,
    gameId,
}: {
    data: GameEventResponse;
    gameId: string;
}) {
    const { language } = useGameEventsLanguage();
    const isCsharp = language === "csharp";
    const displayName = isCsharp ? data.interfaceName : data.name;

    const rows: FieldRow[] = isCsharp
        ? flattenCSharpProperties(data.csharpProperties)
        : data.fields.map((f) => ({
              name: f.name,
              type: f.type,
              comment: f.comment || undefined,
          }));

    return (
        <div>
            <SchemaBreadcrumb
                gameId={gameId}
                name={data.name}
                displayName={displayName}
                basePath="/gameevents-viewer"
            />

            <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-6">
                <div className="flex flex-wrap items-center gap-3">
                    <Zap className="h-5 w-5 shrink-0 text-accent" />
                    <h2 className="font-mono text-2xl font-bold text-white">
                        {displayName}
                    </h2>
                    <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-zinc-500">
                        event
                    </span>
                    <span className="rounded bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-accent">
                        {data.hash}
                    </span>
                </div>

                {data.comment && (
                    <p className="mt-2 text-sm text-zinc-500">{data.comment}</p>
                )}

                <div className="mt-6 grid grid-cols-2 divide-x divide-white/10 rounded-xl border border-white/10">
                    <div className="px-4 py-3 text-center">
                        <div className="font-mono text-xl font-bold text-white">
                            {data.fields.length}
                        </div>
                        <div className="mt-1 font-mono text-xs text-zinc-500">
                            fields
                        </div>
                    </div>
                    <div className="px-4 py-3 text-center">
                        <div className="font-mono text-xl font-bold text-white">
                            {data.files.length}
                        </div>
                        <div className="mt-1 font-mono text-xs text-zinc-500">
                            files
                        </div>
                    </div>
                </div>

                {data.files.length > 0 && (
                    <div className="mt-6">
                        <div className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                            Found in files
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5 font-mono text-xs">
                            {data.files.map((file) => (
                                <span
                                    key={file}
                                    className="flex items-center gap-1 rounded border border-white/10 bg-black/20 px-2 py-1 text-zinc-300"
                                >
                                    <FileText className="h-3 w-3 text-zinc-600" />
                                    {file}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {rows.length > 0 && (
                    <div className="mt-6 space-y-1.5">
                        {rows.map((row) => (
                            <div
                                key={row.name}
                                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg border border-white/10 bg-black/20 px-4 py-3 font-mono text-sm"
                            >
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <Zap className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
                                    <span className="font-semibold text-white">
                                        {row.name}
                                    </span>
                                    <span className="text-zinc-600">:</span>
                                    <span>{row.type}</span>
                                </div>
                                {row.comment && (
                                    <div className="shrink-0 font-mono text-xs text-zinc-500">
                                        {row.comment}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
