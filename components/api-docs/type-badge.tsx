import type { ApiTypeKind } from "@/lib/api-docs/types";

export function TypeBadge({ kind }: { kind: ApiTypeKind }) {
    return (
        <span className="rounded-full border border-accent/30 px-2 py-0.5 text-[10px] uppercase tracking-wide text-accent">
            {kind}
        </span>
    );
}
