import { Download as DownloadIcon } from "lucide-react";
import {
    findDownloadUrl,
    getReleasesWithAssets,
    type DownloadVariant,
} from "@/lib/github";

const OS_LABEL: Record<string, string> = {
    windows: "Windows",
    linux: "Linux",
};

export async function Download({
    version,
    os,
}: {
    version: DownloadVariant;
    os: "windows" | "linux";
}) {
    const releases = await getReleasesWithAssets();
    const resolved = findDownloadUrl(releases, version, os);
    const isBeta = version.endsWith("-beta");
    const hasRuntimes = version.startsWith("latest-runtimes");

    if (!resolved) {
        return (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/20 p-3 font-mono text-xs text-zinc-600">
                {OS_LABEL[os]}
                {hasRuntimes && " (with runtimes)"} - unavailable
            </div>
        );
    }

    return (
        <a
            href={resolved.url}
            className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/20 p-3 font-mono text-sm text-zinc-300 transition-colors hover:border-accent/30 hover:text-accent"
        >
            <span className="flex items-center gap-2">
                {OS_LABEL[os]}
                {hasRuntimes && (
                    <span className="text-xs text-zinc-500">
                        (with runtimes)
                    </span>
                )}
                <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                        isBeta
                            ? "border-amber-400/30 text-amber-400"
                            : "border-accent/30 text-accent"
                    }`}
                >
                    {resolved.tag}
                </span>
            </span>
            <DownloadIcon className="h-4 w-4 shrink-0" />
        </a>
    );
}
