import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ApiBranch } from "@/lib/api-docs/types";
import { apiDocsPrefix, type FlatEntry } from "@/lib/api-docs/tree";

export function PrevNext({
    branch,
    flat,
    categorySlug,
    typeSlug,
}: {
    branch: ApiBranch;
    flat: FlatEntry[];
    categorySlug: string;
    typeSlug: string;
}) {
    const prefix = apiDocsPrefix(branch);
    const index = flat.findIndex(
        (entry) => entry.categorySlug === categorySlug && entry.typeSlug === typeSlug,
    );
    if (index === -1) return null;

    const prev = index > 0 ? flat[index - 1] : null;
    const next = index < flat.length - 1 ? flat[index + 1] : null;
    if (!prev && !next) return null;

    return (
        <div className="mt-12 flex items-center justify-between gap-4 border-t border-white/10 pt-6 font-mono text-sm">
            {prev ? (
                <Link
                    href={`${prefix}/${prev.categorySlug}/${prev.typeSlug}`}
                    className="flex items-center gap-1.5 text-zinc-400 hover:text-accent"
                >
                    <ChevronLeft className="h-4 w-4" />
                    {prev.label}
                </Link>
            ) : (
                <span />
            )}
            {next ? (
                <Link
                    href={`${prefix}/${next.categorySlug}/${next.typeSlug}`}
                    className="flex items-center gap-1.5 text-right text-zinc-400 hover:text-accent"
                >
                    {next.label}
                    <ChevronRight className="h-4 w-4" />
                </Link>
            ) : (
                <span />
            )}
        </div>
    );
}
