"use client";

import Link from "next/link";
import { Boxes } from "lucide-react";
import { SchemaBreadcrumb } from "@/components/schema/breadcrumb";
import { TypeLink } from "@/components/schema/type-link";
import { useSchemaLanguage } from "@/components/schema/language-context";
import type { EntityEntryResponse } from "@/lib/entities/types";

function MemberFieldLink({
    gameId,
    className,
    schemaProject,
    fieldName,
    label,
}: {
    gameId: string;
    className: string;
    schemaProject: string | null;
    fieldName: string;
    label: string;
}) {
    if (!schemaProject) {
        return <span className="text-zinc-500">{label}</span>;
    }
    return (
        <Link
            href={`/schema-viewer/${gameId}/${schemaProject}/${encodeURIComponent(className)}#field-${encodeURIComponent(fieldName)}`}
            className="text-accent hover:underline"
        >
            {label}
        </Link>
    );
}

export function EntityDetail({
    data,
    gameId,
}: {
    data: EntityEntryResponse;
    gameId: string;
}) {
    const { language } = useSchemaLanguage();
    const isCsharp = language === "csharp";

    return (
        <div>
            <SchemaBreadcrumb
                gameId={gameId}
                name={data.className}
                basePath="/entity-viewer"
            />

            <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-6">
                <div className="flex flex-wrap items-center gap-3">
                    <Boxes className="h-5 w-5 shrink-0 text-accent" />
                    <h2 className="font-mono text-2xl font-bold text-white">
                        <TypeLink
                            name={data.className}
                            link={data.schemaLink}
                            gameId={gameId}
                        />
                    </h2>
                    <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-zinc-500">
                        entity data
                    </span>
                </div>

                {data.designerName && (
                    <div className="mt-3 font-mono text-sm text-zinc-400">
                        designer name:{" "}
                        <span className="text-white">{data.designerName}</span>
                    </div>
                )}

                {data.flags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {data.flags.map((flag) => (
                            <span
                                key={flag}
                                className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-zinc-300"
                            >
                                {flag}
                            </span>
                        ))}
                    </div>
                )}

                {data.parentClasses.length > 0 && (
                    <div className="mt-6">
                        <div className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                            Parent Classes
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            {data.parentClasses.map((parent, i) => (
                                <span
                                    key={parent.name}
                                    className="flex items-center gap-2"
                                >
                                    {i > 0 && (
                                        <span className="text-zinc-700">
                                            &rsaquo;
                                        </span>
                                    )}
                                    <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs">
                                        <TypeLink
                                            name={parent.name}
                                            displayName={
                                                isCsharp
                                                    ? parent.csharpName
                                                    : parent.name
                                            }
                                            link={parent.link}
                                            gameId={gameId}
                                        />
                                    </span>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {data.members.length > 0 && (
                    <div className="mt-6">
                        <div className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                            Members ({data.members.length})
                        </div>
                        <div className="mt-2 space-y-1.5">
                            {data.members.map((member) => (
                                <div
                                    key={member.externalName}
                                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg border border-white/10 bg-black/20 px-4 py-3 font-mono text-sm"
                                >
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="font-semibold text-white">
                                            {member.externalName}
                                        </span>
                                        <span className="text-zinc-600">:</span>
                                        <span className="text-zinc-400">
                                            {member.fieldType}
                                        </span>
                                    </div>
                                    <div className="shrink-0 font-mono text-xs">
                                        <MemberFieldLink
                                            gameId={gameId}
                                            className={data.className}
                                            schemaProject={
                                                data.schemaLink?.project ?? null
                                            }
                                            fieldName={member.fieldName}
                                            label={
                                                isCsharp
                                                    ? member.csharpFieldName
                                                    : member.fieldName
                                            }
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {data.inputs.length > 0 && (
                    <div className="mt-6">
                        <div className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                            Inputs ({data.inputs.length})
                        </div>
                        <div className="mt-2 space-y-1.5">
                            {data.inputs.map((input) => (
                                <div
                                    key={input.externalName}
                                    className="flex flex-wrap items-center gap-1.5 rounded-lg border border-white/10 bg-black/20 px-4 py-3 font-mono text-sm"
                                >
                                    <span className="font-semibold text-white">
                                        {input.externalName}
                                    </span>
                                    <span className="text-zinc-600">:</span>
                                    <span className="text-zinc-400">
                                        {input.fieldType}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {data.outputs.length > 0 && (
                    <div className="mt-6">
                        <div className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                            Outputs ({data.outputs.length})
                        </div>
                        <div className="mt-2 space-y-1.5">
                            {data.outputs.map((output) => (
                                <div
                                    key={output.externalName}
                                    className="flex flex-wrap items-center gap-1.5 rounded-lg border border-white/10 bg-black/20 px-4 py-3 font-mono text-sm"
                                >
                                    <span className="font-semibold text-white">
                                        {output.externalName}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {data.thinkFunctions.length > 0 && (
                    <div className="mt-6">
                        <div className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                            Think Functions ({data.thinkFunctions.length})
                        </div>
                        <div className="mt-2 space-y-1.5">
                            {data.thinkFunctions.map((fn) => (
                                <div
                                    key={fn}
                                    className="flex flex-wrap items-center gap-1.5 rounded-lg border border-white/10 bg-black/20 px-4 py-3 font-mono text-sm"
                                >
                                    <span className="font-semibold text-white">
                                        {fn}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
