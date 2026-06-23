import { db } from "@/lib/db";
import { media } from "@/lib/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
// Cache the response at the edge; the bytes never change for a given id.
export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [row] = await db
    .select({ mime: media.mime, data: media.data })
    .from(media)
    .where(eq(media.id, id))
    .limit(1);

  if (!row) {
    return new Response("Not found", { status: 404 });
  }

  // row.data is a Buffer (mode: "buffer"). Slice out a plain ArrayBuffer, which
  // is an accepted BodyInit (Node Buffer is not, per the DOM lib types).
  const view = row.data as unknown as Uint8Array;
  const body = view.buffer.slice(
    view.byteOffset,
    view.byteOffset + view.byteLength
  ) as ArrayBuffer;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": row.mime || "application/octet-stream",
      "Content-Length": String(view.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
