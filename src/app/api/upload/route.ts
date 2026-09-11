import { NextResponse } from "next/server";
import { uploadToStorage } from "@/lib/storage";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadToStorage(
      buffer,
      file.name,
      file.type || "application/octet-stream",
      "uploads"
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || "Upload failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      provider: result.provider,
    });
  } catch (error: any) {
    console.error("User upload error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
