import { z } from "zod";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { McpContext } from "@/lib/mcp/context";

export type ToolShape = Record<string, z.ZodTypeAny>;

export type ToolDef = {
    name: string;
    title: string;
    description: string;
    inputSchema: ToolShape;
    handler: (
        args: Record<string, unknown>,
        ctx: McpContext,
    ) => Promise<CallToolResult>;
};

export type ToolGroup = {
    domain: string;
    tools: ToolDef[];
};

export function defineTool<Shape extends ToolShape>(def: {
    name: string;
    title: string;
    description: string;
    inputSchema: Shape;
    handler: (
        args: z.infer<z.ZodObject<Shape>>,
        ctx: McpContext,
    ) => Promise<CallToolResult>;
}): ToolDef {
    return def as unknown as ToolDef;
}

export type ToolParamInfo = {
    name: string;
    type: string;
    required: boolean;
    description?: string;
    default?: unknown;
    enumValues?: string[];
};

export function describeToolInput(shape: ToolShape): ToolParamInfo[] {
    const jsonSchema = z.toJSONSchema(z.object(shape)) as {
        properties?: Record<string, Record<string, unknown>>;
        required?: string[];
    };
    const required = new Set(jsonSchema.required ?? []);

    return Object.entries(jsonSchema.properties ?? {}).map(([name, prop]) => {
        const enumValues = Array.isArray(prop.enum)
            ? (prop.enum as unknown[]).map(String)
            : undefined;
        const type = enumValues
            ? "enum"
            : Array.isArray(prop.type)
              ? prop.type.join(" | ")
              : ((prop.type as string | undefined) ?? "any");

        return {
            name,
            type,
            required: required.has(name),
            description: prop.description as string | undefined,
            default: prop.default,
            enumValues,
        };
    });
}
