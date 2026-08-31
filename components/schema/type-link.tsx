import Link from "next/link";
import type { ResolvedLink } from "@/lib/schema/queries";

export function TypeLink({
    name,
    displayName,
    link,
    gameId,
}: {
    name: string;
    displayName?: string;
    link: ResolvedLink | null;
    gameId: string;
}) {
    const label = displayName ?? name;

    if (!link) {
        return <span>{label}</span>;
    }

    return (
        <Link
            href={`/schema-viewer/${gameId}/${link.project}/${encodeURIComponent(name)}`}
            className="text-accent hover:underline"
        >
            {label}
        </Link>
    );
}
