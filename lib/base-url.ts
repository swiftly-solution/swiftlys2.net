import { headers } from "next/headers";

export async function getBaseUrl(): Promise<string> {
    const headersList = await headers();
    const host = headersList.get("host") ?? "localhost:3000";
    const isLocal =
        host.startsWith("localhost") || host.startsWith("127.0.0.1");
    const protocol =
        headersList.get("x-forwarded-proto") ?? (isLocal ? "http" : "https");
    return `${protocol}://${host}`;
}
