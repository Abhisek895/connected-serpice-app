import { NextResponse } from "next/server";
import { uploadToStorage } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });
    }

    const isAudio = (file.type && file.type.startsWith("audio/")) || Boolean(file.name?.match(/\.(mp3|wav|m4a|aac|ogg|flac)$/i));
    if (isAudio && file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          message: `Audio file size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 2.0 MB limit. Please trim your audio.`,
        },
        { status: 400 }
      );
    }

    if (file.size > 4.5 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          message: `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds 4.5 MB limit. Please select a smaller file.`,
        },
        { status: 413 }
      );
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
