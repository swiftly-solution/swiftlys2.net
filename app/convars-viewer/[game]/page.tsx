import Link from "next/link";
import { REPO_URL } from "@/lib/github";

const CARD_CLASS = "rounded-2xl border border-white/10 bg-zinc-950/40 p-6";

export default function ConvarsGameIndexPage() {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className={CARD_CLASS}>
                <h2 className="font-semibold text-white">
                    What are ConVars and ConCommands?
                </h2>
                <p className="mt-2 text-sm text-zinc-500">
                    ConVars are console variables - persistent, typed settings
                    with an optional default, min, and max. ConCommands are
                    console commands - callbacks the engine or a module
                    registers to run when invoked. Both carry flags that
                    describe where they can run and who can change them.
                </p>
            </div>

            <div className={CARD_CLASS}>
                <h2 className="font-semibold text-white">
                    What can you find here?
                </h2>
                <p className="mt-2 text-sm text-zinc-500">
                    Look up any convar or concommand by name, see its module,
                    description, flags, and default/min/max where applicable.
                    The data is dumped offline from game files and updated as
                    the game patches - see{" "}
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
                        ConVars &amp; ConCommands
                    </Link>{" "}
                    capability reads and registers these exact entries so your
                    C# plugin code can query or change engine behavior at
                    runtime.
                </p>
            </div>

            <div className={CARD_CLASS}>
                <h2 className="font-semibold text-white">Search tips</h2>
                <p className="mt-2 text-sm text-zinc-500">
                    Type any text in the sidebar search to filter names -
                    matching modules expand automatically. Clear the search to
                    browse module by module instead.{" "}
                    <span className="text-accent">V</span> marks a convar,{" "}
                    <span className="text-amber-400">X</span> marks a
                    concommand.
                </p>
            </div>
        </div>
    );
}
