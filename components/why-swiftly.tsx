const REASONS = [
    {
        title: "Memory-safe by design",
        description:
            "Managed abstractions over the raw Source 2 SDK prevent the memory leaks and crashes common in native modding.",
    },
    {
        title: "Hybrid C++/C# core",
        description:
            "A C++ core with a managed C# layer - plugin code calls straight into natives without leaving C#.",
    },
    {
        title: "Full C# plugin API",
        description:
            "Write plugins in modern C# with typed access to entities, cvars, events and more.",
    },
    {
        title: "Community-driven",
        description:
            "Open-source under GPLv3, built in the open with contributions from the CS2 server community.",
    },
];

export function WhySwiftly() {
    return (
        <section className="mx-auto mt-16 max-w-6xl px-6">
            <h2 className="text-2xl font-bold text-white">Why SwiftlyS2</h2>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {REASONS.map((reason) => (
                    <div
                        key={reason.title}
                        className="rounded-xl border border-white/10 bg-zinc-950/40 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5"
                    >
                        <h3 className="font-semibold text-white">
                            {reason.title}
                        </h3>
                        <p className="mt-1 text-sm text-zinc-500">
                            {reason.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
