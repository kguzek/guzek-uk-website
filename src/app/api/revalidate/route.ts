import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch (error) {
    console.error("Invalid JSON payload", error);
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 },
    );
  }
  const tag = body.tag;

  if (!tag || typeof tag !== "string") {
    return NextResponse.json(
      { error: "Cache tag is required" },
      { status: 400 },
    );
  }

  revalidateTag(tag);
  return NextResponse.json({ success: true, tag });
}
