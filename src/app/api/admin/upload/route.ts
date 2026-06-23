import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { media } from "@/lib/schema";
import { verifyAdminSession } from "@/lib/auth";
import { newId } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_SIZE = 4 * 1024 * 1024; // 4 MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

/**
 * Self-hosted image upload: stores the bytes in the `media` table (Turso/SQLite)
 * and returns a relative URL `/api/media/<id>` that is served back by the
 * companion GET route. No external blob service / dashboard setup required.
 */
export async function POST(req: Request) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Эрхгүй" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Файл оруулна уу" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Файлын хэмжээ хэт том (4MB-ээс ихгүй)" },
      { status: 400 }
    );
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Зөвхөн JPG, PNG, WebP, GIF зураг зөвшөөрнө" },
      { status: 400 }
    );
  }

  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const id = newId();
    await db.insert(media).values({
      id,
      mime: file.type,
      data: buf,
      size: buf.length,
    });
    return NextResponse.json({ url: `/api/media/${id}` });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Upload алдаа";
    console.error("[upload]", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
