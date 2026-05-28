import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { verifyAdminSession } from "@/lib/auth";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(req: Request) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Эрхгүй" }, { status: 401 });
  }
  if (!env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "BLOB_READ_WRITE_TOKEN тохиргоо байхгүй. Vercel-д Blob storage үүсгээд token-оо тохируулна уу.",
      },
      { status: 500 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Файл оруулна уу" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Файлын хэмжээ хэт том (5MB-ээс ихгүй)" },
      { status: 400 }
    );
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Зөвхөн JPG, PNG, WebP, GIF зураг зөвшөөрнө" },
      { status: 400 }
    );
  }

  // Unique blob path
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const blobPath = `products/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  try {
    const blob = await put(blobPath, file, {
      access: "public",
      token: env.BLOB_READ_WRITE_TOKEN,
      contentType: file.type,
    });
    return NextResponse.json({ url: blob.url });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Upload алдаа";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
