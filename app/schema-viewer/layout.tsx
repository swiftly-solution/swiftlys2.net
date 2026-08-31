import type { ReactNode } from "react";

export default function SchemaViewerLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <div className="relative flex-1 overflow-hidden px-6 pb-16 pt-12">
            <div
                className="pointer-events-none absolute inset-x-0 top-0 -z-10"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                    backgroundSize: "48px 48px",
                    maskImage: "linear-gradient(to bottom, black, transparent)",
                    height: "420px",
                }}
            />
            <div className="mx-auto max-w-[1800px]">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-300 sm:text-4xl">
                    Schema <span className="text-accent">Viewer</span>
                </h1>

                {children}
            </div>
        </div>
    );
}
