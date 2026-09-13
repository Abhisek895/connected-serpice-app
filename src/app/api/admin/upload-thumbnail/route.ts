import { NextResponse } from "next/server";
import { uploadToStorage } from "@/lib/storage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // Admin-only guard
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
    if (!user || !["admin", "super_admin"].includes(user.role)) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const demoId = formData.get("demoId") as string;

    if (!file || !demoId) {
      return NextResponse.json({ success: false, message: "Missing file or demoId" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, message: "Only JPEG, PNG, WebP, or GIF allowed" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadToStorage(
      buffer,
      `thumb_${demoId}_${Date.now()}.${file.name.split(".").pop() ?? "jpg"}`,
      file.type,
      `demos/${demoId}`
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || "Upload failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, url: result.url });

  } catch (error: any) {
    console.error("Thumbnail upload error:", error);
    return NextResponse.json({ success: false, message: error.message || "Upload failed" }, { status: 500 });
  }
}
