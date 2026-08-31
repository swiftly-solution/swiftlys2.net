"use client";

import { useEffect, useRef, useState } from "react";

export function CountUp({
    value,
    duration = 900,
}: {
    value: number;
    duration?: number;
}) {
    const ref = useRef<HTMLSpanElement>(null);
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            const id = requestAnimationFrame(() => setDisplay(value));
            return () => cancelAnimationFrame(id);
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                observer.disconnect();

                const start = performance.now();
                const tick = (now: number) => {
                    const progress = Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    setDisplay(Math.round(eased * value));
                    if (progress < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            },
            { threshold: 0.4 },
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [value, duration]);

    return <span ref={ref}>{display}</span>;
}
