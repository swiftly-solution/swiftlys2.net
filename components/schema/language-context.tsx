"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

export type SchemaLanguage = "cpp" | "csharp";

const STORAGE_KEY = "schema-viewer-language";

const LanguageContext = createContext<{
    language: SchemaLanguage;
    setLanguage: (language: SchemaLanguage) => void;
} | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<SchemaLanguage>("csharp");

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored === "cpp" || stored === "csharp") {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setLanguage(stored);
            }
        } catch {}
    }, []);

    const update = (next: SchemaLanguage) => {
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

export function useSchemaLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) {
        throw new Error(
            "useSchemaLanguage must be used within a LanguageProvider",
        );
    }
    return ctx;
}
