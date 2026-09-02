"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

export type ProtobufLanguage = "proto" | "csharp";

const STORAGE_KEY = "protobuf-viewer-language";

const LanguageContext = createContext<{
    language: ProtobufLanguage;
    setLanguage: (language: ProtobufLanguage) => void;
} | null>(null);

export function ProtobufLanguageProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [language, setLanguage] = useState<ProtobufLanguage>("csharp");

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored === "proto" || stored === "csharp") {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setLanguage(stored);
            }
        } catch {}
    }, []);

    const update = (next: ProtobufLanguage) => {
        setLanguage(next);
        try {
            localStorage.setItem(STORAGE_KEY, next);
        } catch {}
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: update }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useProtobufLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) {
        throw new Error(
            "useProtobufLanguage must be used within a ProtobufLanguageProvider",
        );
    }
    return ctx;
}
