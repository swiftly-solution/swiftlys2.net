import type { Metadata } from "next";
import { GridBackdrop } from "@/components/grid-backdrop";
import { ReleaseRail } from "@/components/releases/release-rail";
import { getAllReleases } from "@/lib/releases";

export const metadata: Metadata = {
    title: "Releases - SwiftlyS2",
};

export default async function ReleasesLayout({
    children,
}: LayoutProps<"/releases">) {
    const releases = await getAllReleases();

    return (
        <div className="relative flex-1 px-6 pb-16 pt-12">
            <GridBackdrop />
            <div className="mx-auto max-w-[1350px]">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-300 sm:text-4xl">
                    Release <span className="text-accent">Notes</span>
                </h1>
                <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
                    <ReleaseRail
                        items={releases.map((r) => ({
                            tag: r.tag,
                            date: r.publishedAt?.slice(0, 10) ?? "-",
                            prerelease: r.prerelease,
                        }))}
                    />
                    <div className="min-w-0">{children}</div>
                </div>
            </div>
        </div>
    );
}
