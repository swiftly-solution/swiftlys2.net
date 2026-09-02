"use client";

import { Link2, Boxes } from "lucide-react";
import { SchemaBreadcrumb } from "@/components/schema/breadcrumb";
import { ProtobufTypeLink } from "@/components/protobuf/protobuf-type-link";
import { CSharpTypeDisplay } from "@/components/protobuf/csharp-type";
import { useProtobufLanguage } from "@/components/protobuf/language-context";
import type { ProtobufMessageResponse } from "@/lib/protobuf/api-types";

export function MessageDetail({
    data,
    gameId,
}: {
    data: ProtobufMessageResponse;
    gameId: string;
}) {
    const { language } = useProtobufLanguage();
    const isCsharp = language === "csharp";
    const displayName = isCsharp ? data.csharpName : data.name;

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
                    <Link2 className="h-5 w-5 shrink-0 text-accent" />
                    <h2 className="font-mono text-2xl font-bold text-white">
                        {displayName}
                    </h2>
                    <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-zinc-500">
                        message
                    </span>
                    {!isCsharp && data.messageId !== undefined && (
                        <span className="rounded bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-accent">
                            id {data.messageId}
                        </span>
                    )}
                </div>

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
                                        {isCsharp ? field.csName : field.name}
                                    </span>
                                    <span className="text-zinc-600">:</span>
                                    {isCsharp ? (
                                        <CSharpTypeDisplay
                                            type={field.csType}
                                            gameId={gameId}
                                        />
                                    ) : (
                                        <ProtobufTypeLink
                                            name={field.type}
                                            link={field.typeLink}
                                            gameId={gameId}
                                        />
                                    )}
                                    {!isCsharp && (
                                        <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-zinc-500">
                                            {field.label}
                                        </span>
                                    )}
                                    {!isCsharp && field.defaultValue && (
                                        <span className="text-zinc-600">
                                            = {field.defaultValue}
                                        </span>
                                    )}
                                </div>
                                <div className="shrink-0 font-mono text-xs text-zinc-500">
                                    #{field.number}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
