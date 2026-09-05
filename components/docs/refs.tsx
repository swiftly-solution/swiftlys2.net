import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import {
    resolveApiRef,
    resolveConvarRef,
    resolveEntityRef,
    resolveGameEventRef,
    resolveProtobufRef,
    resolveSchemaRef,
    type DocRef,
} from "@/lib/docs/refs";

function RefLink({ kind, docRef }: { kind: string; docRef: DocRef }) {
    return (
        <Link
            href={docRef.href}
            className="not-prose mx-0.5 inline-flex translate-y-[0.15em] items-center gap-1.5 rounded-md border border-white/10 bg-black/30 px-1.5 py-0.5 align-baseline font-mono text-[0.85em] text-zinc-200 no-underline transition-colors hover:border-accent/40 hover:text-accent"
        >
            <span className="text-[0.75em] uppercase tracking-wide text-zinc-500">
                {kind}
            </span>
            {docRef.label}
        </Link>
    );
}

function BrokenRef({ kind, name }: { kind: string; name: string }) {
    return (
        <span
            title={`${kind} "${name}" not found`}
            className="not-prose mx-0.5 inline-flex translate-y-[0.15em] items-center gap-1.5 rounded-md border border-dashed border-rose-500/40 bg-rose-500/5 px-1.5 py-0.5 align-baseline font-mono text-[0.85em] text-rose-400"
        >
            <AlertTriangle className="h-3 w-3 shrink-0" />
            {name}
        </span>
    );
}

export async function SchemaRef({
    name,
    game,
}: {
    name: string;
    game?: string;
}) {
    const ref = await resolveSchemaRef(name, game);
    return ref ? (
        <RefLink kind="Schema" docRef={ref} />
    ) : (
        <BrokenRef kind="Schema" name={name} />
    );
}

export async function EntityRef({
    name,
    game,
}: {
    name: string;
    game?: string;
}) {
    const ref = await resolveEntityRef(name, game);
    return ref ? (
        <RefLink kind="Entity" docRef={ref} />
    ) : (
        <BrokenRef kind="Entity" name={name} />
    );
}

export async function ProtobufRef({
    name,
    game,
}: {
    name: string;
    game?: string;
}) {
    const ref = await resolveProtobufRef(name, game);
    return ref ? (
        <RefLink kind="Protobuf" docRef={ref} />
    ) : (
        <BrokenRef kind="Protobuf" name={name} />
    );
}

export async function GameEventRef({
    name,
    game,
}: {
    name: string;
    game?: string;
}) {
    const ref = await resolveGameEventRef(name, game);
    return ref ? (
        <RefLink kind="Event" docRef={ref} />
    ) : (
        <BrokenRef kind="Event" name={name} />
    );
}

export async function ConvarRef({
    name,
    game,
}: {
    name: string;
    game?: string;
}) {
    const ref = await resolveConvarRef(name, game);
    return ref ? (
        <RefLink kind="ConVar" docRef={ref} />
    ) : (
        <BrokenRef kind="ConVar" name={name} />
    );
}

export async function ApiRef({
    name,
    member,
    branch,
}: {
    name: string;
    member?: string;
    branch?: string;
}) {
    const ref = await resolveApiRef(name, branch, member);
    return ref ? (
        <RefLink kind="API" docRef={ref} />
    ) : (
        <BrokenRef kind="API" name={member ? `${name}.${member}` : name} />
    );
}
