import Link from "next/link";
import { REPO_URL } from "@/lib/github";

const CARD_CLASS = "rounded-2xl border border-white/10 bg-zinc-950/40 p-6";

export default function EntityGameIndexPage() {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className={CARD_CLASS}>
                <h2 className="font-semibold text-white">
                    What is entity data?
                </h2>
                <p className="mt-2 text-sm text-zinc-500">
                    Every spawnable Source 2 entity class has a data
                    description: its Hammer inputs, outputs, and keyvalue
                    members, plus its registered think functions. This is what
                    maps entity-tool fields to the actual schema members backing
                    them at runtime.
                </p>
            </div>

            <div className={CARD_CLASS}>
                <h2 className="font-semibold text-white">
                    What can you find here?
                </h2>
                <p className="mt-2 text-sm text-zinc-500">
                    Look up any class with a data description. Members show
                    their keyvalue name and type, and link straight to the
                    backing schema field. Inputs show their handler signature,
                    outputs show the fireable output name, and think functions
                    list the class&apos;s registered callbacks.
                </p>
            </div>

            <div className={CARD_CLASS}>
                <h2 className="font-semibold text-white">
                    Members &amp; CEntityKeyValues
                </h2>
                <p className="mt-2 text-sm text-zinc-500">
                    Members are what{" "}
                    <code className="text-zinc-400">CEntityKeyValues</code> uses
                    to set schema fields by name - the same lookup Hammer entity
                    properties and{" "}
                    <Link
                        href={REPO_URL}
                        className="text-accent hover:underline"
                    >
                        SwiftlyS2
                    </Link>{" "}
                    plugin code go through to read or write an entity&apos;s
                    keyvalues at runtime.
                </p>
            </div>

            <div className={CARD_CLASS}>
                <h2 className="font-semibold text-white">Search tips</h2>
                <p className="mt-2 text-sm text-zinc-500">
                    Type any text in the sidebar search to filter class names.
                    Not every class here is a spawnable entity - some are plain
                    structs with their own data description, such as embedded
                    value types used by other entities.
                </p>
            </div>
        </div>
    );
}
