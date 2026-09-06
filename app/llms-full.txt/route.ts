import { getBaseUrl } from "@/lib/base-url";
import { buildLlmsFullTxt } from "@/lib/llms/build";

export const dynamic = "force-dynamic";

export async function GET() {
    const baseUrl = await getBaseUrl();
    const body = await buildLlmsFullTxt(baseUrl);
    return new Response(body, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
}
