import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { put, del } from "@vercel/blob";

function getBlobToken() {
  return (
    process.env.BLOB_READ_WRITE_TOKEN ||
    Object.entries(process.env).find(([k]) => k.endsWith("_READ_WRITE_TOKEN"))?.[1]
  );
}

// ─── ADMIN AUTH GUARD ──────────────────────────────────────────────────────────
async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true, email: true },
  });

  if (!user || !["admin", "super_admin"].includes(user.role)) {
    return null;
  }
  return user;
}

// ─── DELETE BLOB ──────────────────────────────────────────────────────────────
export async function DELETE(req: Request) {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { url, pathname } = await req.json();
    if (!url) {
      return NextResponse.json({ success: false, message: "Missing blob URL" }, { status: 400 });
    }

    const token = getBlobToken();

    // 1. Delete physically from Vercel Cloud Storage
    try {
      await del(url, token ? { token } : undefined);
    } catch (blobErr: any) {
      console.warn("[Admin Blobs] Warning deleting from Vercel Blob:", blobErr?.message);
    }

    // 2. Clean up Prisma database references
    // Delete any Media records
    await prisma.media.deleteMany({
      where: { url },
    }).catch(() => {});

    // Clear Theme thumbnailUrl if matched
    await prisma.theme.updateMany({
      where: { thumbnailUrl: url },
      data: { thumbnailUrl: "/demos/surprise/thumb_surprise_1786296446260.jpg" },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: `Successfully deleted blob ${pathname || url}`,
    });
  } catch (error: any) {
    console.error("[Admin Blobs] DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete blob" },
      { status: 500 }
    );
  }
}

// ─── REPLACE BLOB (PUT) ────────────────────────────────────────────────────────
export async function PUT(req: Request) {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const oldUrl = formData.get("oldUrl") as string;
    const pathname = formData.get("pathname") as string;

    if (!file || !pathname) {
      return NextResponse.json(
        { success: false, message: "Missing replacement file or pathname" },
        { status: 400 }
      );
    }

    const token = getBlobToken();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const cleanPathname = pathname.replace(/^\/+/, "");

    // Standardize Content-Type
    const ext = cleanPathname.split(".").pop()?.toLowerCase() || "jpg";
    let cleanContentType = file.type;
    if (!cleanContentType || cleanContentType === "application/octet-stream") {
      if (ext === "mp3") cleanContentType = "audio/mpeg";
      else if (ext === "m4a") cleanContentType = "audio/mp4";
      else if (ext === "wav") cleanContentType = "audio/wav";
      else if (ext === "webp") cleanContentType = "image/webp";
      else if (ext === "png") cleanContentType = "image/png";
      else if (ext === "mp4") cleanContentType = "video/mp4";
      else cleanContentType = "image/jpeg";
    }

    // Overwrite the blob at the exact pathname (allowOverwrite: true permits replacing existing files)
    const newBlob = await put(cleanPathname, buffer, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: cleanContentType,
      token: token || undefined,
    });

    // If new URL is different from oldUrl, delete old URL to keep storage clean
    if (oldUrl && oldUrl !== newBlob.url) {
      try {
        await del(oldUrl, token ? { token } : undefined);
      } catch (delErr) {
        console.warn("[Admin Blobs] Warning deleting old blob during replacement:", delErr);
      }
    }

    // Update database records that used oldUrl
    if (oldUrl && oldUrl !== newBlob.url) {
      await prisma.media.updateMany({
        where: { url: oldUrl },
        data: { url: newBlob.url },
      }).catch(() => {});

      await prisma.theme.updateMany({
        where: { thumbnailUrl: oldUrl },
        data: { thumbnailUrl: newBlob.url },
      }).catch(() => {});

      // Update customData JSON in events if matched
      try {
        const eventsWithOldUrl = await prisma.event.findMany({
          where: {
            customData: {
              contains: oldUrl,
            },
          },
          select: { id: true, customData: true },
        });

        for (const ev of eventsWithOldUrl) {
          if (ev.customData) {
            const updatedCustomData = ev.customData.split(oldUrl).join(newBlob.url);
            await prisma.event.update({
              where: { id: ev.id },
              data: { customData: updatedCustomData },
            });
          }
        }
      } catch (evErr) {
        console.warn("[Admin Blobs] Warning updating event customData:", evErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Blob replaced successfully",
      blob: {
        url: newBlob.url,
        pathname: newBlob.pathname,
        size: buffer.length,
        uploadedAt: new Date().toISOString(),
        contentType: cleanContentType,
      },
    });
  } catch (error: any) {
    console.error("[Admin Blobs] PUT Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to replace blob" },
      { status: 500 }
    );
  }
}

// ─── UPLOAD NEW BLOB (POST) ────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return NextResponse.json({ success: false, message: "Missing file" }, { status: 400 });
    }

    const token = getBlobToken();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const cleanFolder = folder.replace(/^\/+|\/+$/g, "");
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const uniqueName = `${cleanFolder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const newBlob = await put(uniqueName, buffer, {
      access: "public",
      contentType: file.type || "application/octet-stream",
      token: token || undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Blob uploaded successfully",
      blob: {
        url: newBlob.url,
        pathname: newBlob.pathname,
        size: buffer.length,
        uploadedAt: new Date().toISOString(),
        contentType: file.type,
      },
    });
  } catch (error: any) {
    console.error("[Admin Blobs] POST Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to upload blob" },
      { status: 500 }
    );
  }
}
