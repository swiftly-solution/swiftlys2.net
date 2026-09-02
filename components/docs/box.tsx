import type { ReactNode } from "react";

export function Box({
    class: className,
    children,
}: {
    class?: string;
    children: ReactNode;
}) {
    return <div className={`my-4 gap-3 ${className ?? ""}`}>{children}</div>;
}
