import { NextResponse } from "next/server";
import { listItems, createItem } from "@/lib/items";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json(listItems());
}

export async function POST(req: Request) {
  const body = await req.json();
  const item = createItem({
    name: body.name, brand: body.brand ?? null, category: body.category,
    image_path: body.image_path ?? null,
  });
  return NextResponse.json(item, { status: 201 });
}
