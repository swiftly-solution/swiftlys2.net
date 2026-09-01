"use client";

import { Link2, Database } from "lucide-react";
import Link from "next/link";
import { SchemaBreadcrumb } from "@/components/schema/breadcrumb";
import { TypeLink } from "@/components/schema/type-link";
import { ReferencedBy } from "@/components/schema/referenced-by";
import { useSchemaLanguage } from "@/components/schema/language-context";
import type { ClassEntryResponse } from "@/lib/schema/api-types";

export function ClassDetail({
    data,
    gameId,
}: {
    data: ClassEntryResponse;
    gameId: string;
}) {
    const { language } = useSchemaLanguage();
    const isCsharp = language === "csharp";
    const displayName = isCsharp ? data.csharpName : data.name;

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
                    <Link2 className="h-5 w-5 shrink-0 text-accent" />
                    <h2 className="font-mono text-2xl font-bold text-white">
                        {displayName}
                    </h2>
                    <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-zinc-500">
                        {data.is_struct ? "struct" : "class"}
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
                            {data.fields.length}
                        </div>
                        <div className="mt-1 font-mono text-xs text-zinc-500">
                            fields
                        </div>
                    </div>
                </div>

                {data.hasEntityData && (
                    <div className="mt-6">
                        <div className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                            Entity Data
                        </div>
                        <div className="mt-2">
                            <Link
                                href={`/entity-viewer/${gameId}/${encodeURIComponent(data.name)}`}
                                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 font-mono text-xs text-zinc-300 transition-colors hover:border-accent/30 hover:text-accent"
                            >
                                <Database className="h-3.5 w-3.5 text-zinc-500" />
                                view inputs, outputs, members &amp; think
                                functions
                            </Link>
                        </div>
                    </div>
                )}

                {data.baseClasses.length > 0 && (
                    <div className="mt-6">
                        <div className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                            Inherits from
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5 font-mono text-sm">
                            {data.baseClasses.map((base, i) => (
                                <span
                                    key={base.name}
                                    className="flex items-center gap-1.5"
                                >
                                    {i > 0 && (
                                        <span className="text-zinc-700">
                                            &rsaquo;
                                        </span>
                                    )}
                                    <TypeLink
                                        name={base.name}
                                        displayName={
                                            isCsharp
                                                ? base.csharpName
                                                : base.name
                                        }
                                        link={base.link}
                                        gameId={gameId}
                                    />
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {data.fields.length > 0 && (
                    <div className="mt-6 space-y-1.5">
                        {data.fields.map((field) => (
                            <div
                                key={field.name}
                                id={`field-${field.name}`}
                                className="flex scroll-mt-24 flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg border border-white/10 bg-black/20 px-4 py-3 font-mono text-sm [&:target]:border-accent/50"
                            >
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <Link2 className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
                                    <span className="font-semibold text-white">
                                        {isCsharp
                                            ? field.csharpName
                                            : field.name}
                                    </span>
                                    <span className="text-zinc-600">:</span>
                                    <TypeLink
                                        name={field.type}
                                        displayName={
                                            isCsharp
                                                ? field.csharpType
                                                : (field.templated ??
                                                  field.type)
                                        }
                                        link={field.typeLink}
                                        gameId={gameId}
                                    />
                                    {!isCsharp &&
                                        field.kind === "fixed_array" &&
                                        field.element_count !== undefined && (
                                            <span className="text-zinc-600">
                                                &times; {field.element_count}
                                            </span>
                                        )}
                                    {field.networked && (
                                        <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-accent">
                                            net
                                        </span>
                                    )}
                                </div>
                                <div className="shrink-0 font-mono text-xs text-zinc-500">
                                    {field.offset} (0x
                                    {field.offset.toString(16).toUpperCase()})
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <ReferencedBy references={data.references} gameId={gameId} />
            </div>
        </div>
    );
}
