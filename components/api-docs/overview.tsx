import Link from "next/link";
import type { ApiBranch } from "@/lib/api-docs/types";
import { apiDocsPrefix, type ApiNavCategory } from "@/lib/api-docs/tree";

export function ApiDocsOverview({
    branch,
    categories,
}: {
    branch: ApiBranch;
    categories: ApiNavCategory[];
}) {
    const prefix = apiDocsPrefix(branch);
    const typeCount = categories.reduce((sum, c) => sum + c.types.length, 0);

    return (
        <div className="min-w-0">
            <h1 className="font-mono text-3xl font-bold text-white">API Reference</h1>
            <p className="mt-4 max-w-2xl leading-relaxed text-zinc-400">
                Browse the SwiftlyS2 {branch} API - {categories.length} categories,{" "}
                {typeCount} types. Pick a category from the sidebar, or search with &#8984;K.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {categories.map((category) => (
                    <div
                        key={category.slug}
                        className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4"
                    >
                        <div className="font-mono text-sm font-semibold text-white">{category.name}</div>
                        <div className="mt-2 space-y-1">
                            {category.types.slice(0, 5).map((type) => (
                                <Link
                                    key={type.slug}
                                    href={`${prefix}/${category.slug}/${type.slug}`}
                                    className="block font-mono text-xs text-zinc-500 hover:text-accent"
                                >
                                    {type.name}
                                </Link>
                            ))}
                            {category.types.length > 5 && (
                                <div className="font-mono text-xs text-zinc-600">
                                    +{category.types.length - 5} more
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
