import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { getBaseUrl } from "@/lib/base-url";
import { createMcpServer } from "@/lib/mcp/server";

export const dynamic = "force-dynamic";

async function handle(req: Request): Promise<Response> {
    const baseUrl = await getBaseUrl();
    const server = createMcpServer(baseUrl);
    const transport = new WebStandardStreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
    });

    await server.connect(transport);
    return transport.handleRequest(req);
}

export { handle as GET, handle as POST, handle as DELETE };
