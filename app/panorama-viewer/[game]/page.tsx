import Link from "next/link";
import { REPO_URL } from "@/lib/github";

const CARD_CLASS = "rounded-2xl border border-white/10 bg-zinc-950/40 p-6";

export default function PanoramaGameIndexPage() {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className={CARD_CLASS}>
                <h2 className="font-semibold text-white">
                    What is Panorama?
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                    Panorama is Source 2&apos;s UI framework - HTML-like
                    layout files styled with a CSS-like language. This viewer
                    covers that styling language: every property Valve&apos;s
                    UI engine recognizes, like{" "}
                    <code className="text-zinc-400">box-shadow</code> or{" "}
                    <code className="text-zinc-400">wash-color</code>.
                </p>
            </div>

            <div className={CARD_CLASS}>
                <h2 className="font-semibold text-white">
                    What can you find here?
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                    Look up any Panorama CSS property by name and read its
                    description straight from Valve&apos;s own dump, including
                    accepted values and usage examples where documented. Data
                    is dumped offline and updated as the game patches - see{" "}
                    <Link
                        href="https://github.com/Swiftly-Tracker/CS2-Dumps"
                        className="text-accent hover:underline"
                    >
                        Swiftly-Tracker/CS2-Dumps
                    </Link>
                    .
                </p>
            </div>

            <div className={CARD_CLASS}>
                <h2 className="font-semibold text-white">
                    How SwiftlyS2 uses this
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                    This is the same property list{" "}
                    <Link
                        href={REPO_URL}
                        className="text-accent hover:underline"
                    >
                        SwiftlyS2
                    </Link>{" "}
                    plugins style their custom Panorama layouts against.
                </p>
            </div>

            <div className={CARD_CLASS}>
                <h2 className="font-semibold text-white">Search tips</h2>
                <p className="mt-2 text-sm text-zinc-400">
                    Type any text in the sidebar search to filter properties
                    by name. Clear the search to browse the full alphabetical
                    list instead.
                </p>
            </div>
        </div>
    );
}
