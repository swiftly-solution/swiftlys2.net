import { Children, cloneElement, isValidElement, type ReactNode } from "react";

export function Steps({ children }: { children: ReactNode }) {
    const items = Children.toArray(children).filter(isValidElement);

    return (
        <div className="my-4 flex flex-col">
            {items.map((child, index) =>
                cloneElement(child as React.ReactElement<StepProps>, {
                    index: index + 1,
                    isLast: index === items.length - 1,
                    key: index,
                }),
            )}
        </div>
    );
}

type StepProps = {
    title?: string;
    children: ReactNode;
    index?: number;
    isLast?: boolean;
};

export function Step({ title, children, index, isLast }: StepProps) {
    return (
        <div className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
                <div className="absolute left-3.5 top-8 h-[calc(100%-1.75rem)] w-px bg-white/10" />
            )}
            <div className="z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-zinc-900 font-mono text-xs text-zinc-300">
                {index}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
                {title && (
                    <h4 className="font-mono text-base font-semibold text-white">
                        {title}
                    </h4>
                )}
                <div className="mt-2 [&>:first-child]:mt-0 [&>:last-child]:mb-0">
                    {children}
                </div>
            </div>
        </div>
    );
}
