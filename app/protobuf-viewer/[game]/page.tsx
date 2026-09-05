import Link from "next/link";
import { REPO_URL } from "@/lib/github";

const CARD_CLASS = "rounded-2xl border border-white/10 bg-zinc-950/40 p-6";

export default function ProtobufGameIndexPage() {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className={CARD_CLASS}>
                <h2 className="font-semibold text-white">
                    What are these protobufs?
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                    Source 2 games exchange a lot of internal state - game
                    events, network messages, tooling data - through Protocol
                    Buffer messages compiled straight into each binary (
                    <code className="text-zinc-400">client.dll</code>,{" "}
                    <code className="text-zinc-400">server.dll</code>, and
                    others). This viewer lets you browse every message and enum
                    recovered from those binaries.
                </p>
            </div>

            <div className={CARD_CLASS}>
                <h2 className="font-semibold text-white">
                    What can you find here?
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                    Look up any message or enum by name, see its fields (label,
                    type, field number, default value), and follow links between
                    related message types. Each entry also lists which binaries
                    it was found in. Data is dumped offline and updated as the
                    game patches - see{" "}
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
                    This is the same kind of message layout data{" "}
                    <Link
                        href={REPO_URL}
                        className="text-accent hover:underline"
                    >
                        SwiftlyS2
                    </Link>{" "}
                    can decode when hooking network messages and game events
                    from your C# plugin code.
                </p>
            </div>

            <div className={CARD_CLASS}>
                <h2 className="font-semibold text-white">Search tips</h2>
                <p className="mt-2 text-sm text-zinc-400">
                    Type any text in the sidebar search to filter message, enum,
                    and field names - matching files expand automatically. Clear
                    the search to browse file by file instead. Field types link
                    to their own page whenever the referenced message or enum is
                    unambiguous.
                </p>
            </div>
        </div>
    );
}
