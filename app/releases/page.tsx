import { redirect } from "next/navigation";
import { getAllReleases } from "@/lib/releases";

export default async function ReleasesIndexPage() {
    const releases = await getAllReleases();
    const latest = releases.find((r) => !r.prerelease) ?? releases[0];

    if (!latest) {
        return (
            <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-6 text-center text-sm text-zinc-500">
                Releases are temporarily unavailable - try again shortly.
            </div>
        );
    }

    redirect(`/releases/${encodeURIComponent(latest.tag)}`);
}
