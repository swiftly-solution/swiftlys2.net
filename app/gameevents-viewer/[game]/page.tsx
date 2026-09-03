import Link from "next/link";
import { REPO_URL } from "@/lib/github";

const CARD_CLASS = "rounded-2xl border border-white/10 bg-zinc-950/40 p-6";

export default function GameEventsGameIndexPage() {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className={CARD_CLASS}>
                <h2 className="font-semibold text-white">
                    What are game events?
                </h2>
                <p className="mt-2 text-sm text-zinc-500">
                    Game events are Source 2&apos;s KeyValues-defined broadcast
                    messages - things like{" "}
                    <code className="text-zinc-400">player_death</code> or{" "}
                    <code className="text-zinc-400">round_start</code> - each
                    with a fixed set of typed fields. They&apos;re declared
                    across three files that layer on top of each other:{" "}
                    <code className="text-zinc-400">core.gameevents</code>,{" "}
                    <code className="text-zinc-400">game.gameevents</code>, and{" "}
                    <code className="text-zinc-400">mod.gameevents</code>.
                </p>
            </div>

            <div className={CARD_CLASS}>
                <h2 className="font-semibold text-white">
                    What can you find here?
                </h2>
                <p className="mt-2 text-sm text-zinc-500">
                    Look up any event by name and see its fields, the native
                    type each was declared with, and which files declare or
                    extend it - a later file can add fields to an event a prior
                    file already defined. Data is dumped offline and updated as
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
                    This is the same data{" "}
                    <Link
                        href={REPO_URL}
                        className="text-accent hover:underline"
                    >
                        SwiftlyS2
                    </Link>{" "}
                    generates typed C# event interfaces from - switch to the C#
                    view to see the exact property names, types, and event hash
                    your plugin code would work with.
                </p>
            </div>

            <div className={CARD_CLASS}>
                <h2 className="font-semibold text-white">Search tips</h2>
                <p className="mt-2 text-sm text-zinc-500">
                    Type any text in the sidebar search to filter event and
                    field names, or paste a hash (with or without the{" "}
                    <code className="text-zinc-400">0x</code> prefix) to find
                    the event it belongs to. Clear the search to browse file by
                    file instead.
                </p>
            </div>
        </div>
    );
}
