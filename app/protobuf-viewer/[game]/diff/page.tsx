import { getBaseUrl } from "@/lib/base-url";
import { ProtobufDiffView } from "@/components/protobuf/protobuf-diff-view";
import type { ProtobufDiff } from "@/lib/protobuf/diff";

export default async function ProtobufDiffPage(
    props: PageProps<"/protobuf-viewer/[game]/diff">,
) {
    const { game: gameId } = await props.params;
    const searchParams = await props.searchParams;
    const from = typeof searchParams.from === "string" ? searchParams.from : "";
    const to = typeof searchParams.to === "string" ? searchParams.to : "";

    if (!from || !to) {
        return (
            <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-6 text-center text-sm text-zinc-500">
                Missing <span className="font-mono">from</span>/
                <span className="font-mono">to</span> parameters - pick two
                versions from the{" "}
                <a
                    href={`/protobuf-viewer/${gameId}/versions`}
                    className="text-accent hover:underline"
                >
                    versions page
                </a>
                .
            </div>
        );
    }

    const baseUrl = await getBaseUrl();
    const res = await fetch(
        `${baseUrl}/api/protobuf/diff?game=${gameId}&from=${from}&to=${to}`,
    );

    if (!res.ok) {
        return (
            <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-6 text-center text-sm text-zinc-500">
                Diff data is temporarily unavailable - try again shortly.
            </div>
        );
    }

    const diff: ProtobufDiff = await res.json();
    return <ProtobufDiffView diff={diff} from={from} to={to} />;
}
