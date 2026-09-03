export function GridBackdrop() {
    return (
        <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px]"
            style={{
                backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
                maskImage: "linear-gradient(to bottom, black, transparent)",
                WebkitMaskImage:
                    "linear-gradient(to bottom, black, transparent)",
            }}
        />
    );
}
