import Link from "next/link";
import type { ProtobufLink } from "@/lib/protobuf/queries";

export function ProtobufTypeLink({
    name,
    link,
    gameId,
}: {
    name: string;
    link: ProtobufLink | null;
    gameId: string;
}) {
    const label = name.replace(/^\.+/, "");

    if (!link) {
        return <span>{label}</span>;
    }

    return (
        <Link
            href={`/protobuf-viewer/${gameId}/${encodeURIComponent(link.file)}/${encodeURIComponent(link.name)}`}
            className="text-accent hover:underline"
        >
            {label}
        </Link>
    );
}
