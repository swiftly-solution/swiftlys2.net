import { getBaseUrl } from "@/lib/base-url";
import { ConvarsDiffView } from "@/components/convars/convars-diff-view";
import type { ConvarsDiff } from "@/lib/convars/diff";

export default async function ConvarsDiffPage(
    props: PageProps<"/convars-viewer/[game]/diff">,
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
                    href={`/convars-viewer/${gameId}/versions`}
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
        `${baseUrl}/api/convars/diff?game=${gameId}&from=${from}&to=${to}`,
    );

    if (!res.ok) {
        return (
            <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-6 text-center text-sm text-zinc-500">
                Diff data is temporarily unavailable - try again shortly.
            </div>
        );
    }

    const diff: ConvarsDiff = await res.json();
    return <ConvarsDiffView diff={diff} from={from} to={to} />;
}
