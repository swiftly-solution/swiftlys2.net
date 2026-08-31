import { NextResponse } from "next/server";
import { getLanguageBreakdown } from "@/lib/github";

export async function GET() {
    const languages = await getLanguageBreakdown();
    return NextResponse.json(languages);
}
