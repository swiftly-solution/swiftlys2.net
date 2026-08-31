import Link from "next/link";
import { REPO_URL } from "@/lib/github";

const CARD_CLASS = "rounded-2xl border border-white/10 bg-zinc-950/40 p-6";

export default function SchemaGameIndexPage() {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className={CARD_CLASS}>
                <h2 className="font-semibold text-white">
                    What is the Source 2 schema system?
                </h2>
                <p className="mt-2 text-sm text-zinc-500">
                    Source 2&apos;s schema system is the engine&apos;s runtime
                    reflection layer: every class, field, enum, offset, and
                    inheritance chain is exposed for introspection - not just
                    networked fields, but the full memory layout of every
                    registered type. Game modules like{" "}
                    <code className="text-zinc-400">client.dll</code> and{" "}
                    <code className="text-zinc-400">server.dll</code> each
                    register their own types into this system.
                </p>
            </div>

            <div className={CARD_CLASS}>
                <h2 className="font-semibold text-white">
                    What can you find here?
                </h2>
                <p className="mt-2 text-sm text-zinc-500">
                    Look up any class or enum, see its base classes and fields,
                    and follow links between related types. Field rows show
                    name, type, byte offset, size, and whether the field is
                    networked. The data is dumped offline from game files and
                    updated as the game patches - see{" "}
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
                <p className="mt-2 text-sm text-zinc-500">
                    This is the same kind of data{" "}
                    <Link
                        href={REPO_URL}
                        className="text-accent hover:underline"
                    >
                        SwiftlyS2
                    </Link>{" "}
                    resolves internally - the framework&apos;s{" "}
                    <Link
                        href="/#capabilities"
                        className="text-accent hover:underline"
                    >
                        Game data &amp; signatures
                    </Link>{" "}
                    and{" "}
                    <span className="text-zinc-400">Memory manipulation</span>{" "}
                    capabilities read these exact offsets and class layouts at
                    runtime so your C# plugin code can talk to native engine
                    memory directly.
                </p>
            </div>

            <div className={CARD_CLASS}>
                <h2 className="font-semibold text-white">Search tips</h2>
                <p className="mt-2 text-sm text-zinc-500">
                    Type any text in the sidebar search to filter class, field,
                    and enum names - matching modules expand automatically.
                    Clear the search to browse module by module instead.
                    Cross-references (a field&apos;s type, a base class) link to
                    their own page whenever the name is unambiguous.
                </p>
            </div>
        </div>
    );
}
