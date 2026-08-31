import Link from "next/link";
import type { Reference } from "@/lib/schema/queries";

const DISPLAY_LIMIT = 40;

export function ReferencedBy({
    references,
    gameId,
}: {
    references: Reference[];
    gameId: string;
}) {
    if (references.length === 0) return null;

    const shown = references.slice(0, DISPLAY_LIMIT);
    const hidden = references.length - shown.length;

    return (
        <div className="mt-6">
            <div className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                Referenced by ({references.length})
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
                {shown.map((ref) => (
                    <Link
                        key={`${ref.project}/${ref.className}/${ref.label}`}
                        href={`/schema-viewer/${gameId}/${ref.project}/${encodeURIComponent(ref.className)}`}
                        className="rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 font-mono text-xs text-zinc-400 transition-colors hover:border-accent/30 hover:text-accent"
                    >
                        {ref.className}
                        <span className="text-zinc-600">.{ref.label}</span>
                    </Link>
                ))}
                {hidden > 0 && (
                    <span className="px-3 py-1.5 font-mono text-xs text-zinc-600">
                        +{hidden} more
                    </span>
                )}
            </div>
        </div>
    );
}
