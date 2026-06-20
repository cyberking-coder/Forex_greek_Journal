import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getStorage } from "@/lib/storage";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Only image files are allowed" },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image must be 5 MB or smaller" },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const { url } = await getStorage().upload({
      buffer,
      filename: file.name,
      contentType: file.type,
      userId: user.id,
    });
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[upload] failed", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
