import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // ── 1. Authentication Check (Session or Admin Secret Header) ──
    const session = await getServerSession(authOptions);
    const url = new URL(req.url);
    const secretKey = req.headers.get("x-admin-key") || url.searchParams.get("key");
    const expectedSecret = process.env.NEXTAUTH_SECRET;

    let isAuthorized = false;

    if (secretKey && expectedSecret && secretKey === expectedSecret) {
      isAuthorized = true;
    } else if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true },
      });
      if (user && ["admin", "super_admin"].includes(user.role)) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Please log in as an administrator to view system telemetry.",
        },
        { status: 401 }
      );
    }

    // ── 2. Database Live Health & Latency Measurement ──
    let dbStatus = "HEALTHY";
    let dbLatencyMs = 0;
    let dbError: string | null = null;

    try {
      const dbStart = performance.now();
      await prisma.user.findFirst({ select: { id: true } });
      dbLatencyMs = Math.round((performance.now() - dbStart) * 10) / 10;
    } catch (err: any) {
      dbStatus = "ERROR";
      dbError = err.message || "Failed to query database";
    }

    // Database counts
    const [
      totalUsers,
      totalEvents,
      totalPayments,
      publishedPages,
      totalResponses,
      totalThemes,
    ] = await Promise.all([
      prisma.user.count().catch(() => 0),
      prisma.event.count().catch(() => 0),
      prisma.payment.count().catch(() => 0),
      prisma.event.count({ where: { status: "PUBLISHED" } }).catch(() => 0),
      prisma.response.count().catch(() => 0),
      prisma.theme.count().catch(() => 0),
    ]);

    // Detect DB Host (e.g. Neon, AWS, Local)
    const dbUrl = process.env.DATABASE_URL || "";
    let dbProvider = "PostgreSQL (Self-Hosted)";
    if (dbUrl.includes("neon.tech")) dbProvider = "Neon Serverless PostgreSQL (AWS us-east-2)";
    else if (dbUrl.includes("supabase.co")) dbProvider = "Supabase PostgreSQL";
    else if (dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1")) dbProvider = "Local Database";

    // ── 3. Storage Subsystem Telemetry ──
    const hasVercelBlob = Boolean(
      process.env.BLOB_READ_WRITE_TOKEN ||
      Object.keys(process.env).some((k) => k.endsWith("_READ_WRITE_TOKEN"))
    );
    const hasCloudinary = Boolean(process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME);
    const isVercel = Boolean(process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV);

    let activeStorageProvider = "Local Disk Storage";
    if (hasVercelBlob) activeStorageProvider = "Vercel Blob Storage (Cloud CDN)";
    else if (hasCloudinary) activeStorageProvider = "Cloudinary Media CDN";
    else if (isVercel) activeStorageProvider = "Unconfigured (Serverless Read-Only — Needs Vercel Blob or Cloudinary)";

    // Inspect local uploads directory if available
    let localUploadsCount = 0;
    let localUploadsSizeBytes = 0;
    const uploadsPath = path.join(process.cwd(), "public", "uploads");

    if (!isVercel && fs.existsSync(uploadsPath)) {
      try {
        const files = fs.readdirSync(uploadsPath);
        localUploadsCount = files.length;
        for (const file of files) {
          const stats = fs.statSync(path.join(uploadsPath, file));
          localUploadsSizeBytes += stats.size;
        }
      } catch {
        // Ignored in restricted environments
      }
    }

    // ── 4. Memory & Server Compute Diagnostics ──
    const memory = process.memoryUsage();
    const uptimeSeconds = Math.floor(process.uptime());
    const uptimeFormatted = `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${uptimeSeconds % 60}s`;

    // ── 5. Integration Services Status ──
    const integrations = {
      razorpay: {
        configured: Boolean(process.env.RAZORPAY_KEY_ID),
        mode: process.env.RAZORPAY_KEY_ID?.startsWith("rzp_live_") ? "LIVE_PRODUCTION" : "TEST_SANDBOX",
        webhookConfigured: Boolean(process.env.RAZORPAY_WEBHOOK_SECRET),
      },
      smtpEmail: {
        configured: Boolean(process.env.SMTP_USER),
        service: process.env.SMTP_SERVICE || "custom_smtp",
        sender: process.env.FROM_EMAIL || process.env.SMTP_USER || "None",
      },
      googleOAuth: {
        configured: Boolean(process.env.GOOGLE_CLIENT_ID),
      },
      nextAuth: {
        secretConfigured: Boolean(process.env.NEXTAUTH_SECRET),
        appUrl: process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      },
    };

    const telemetry = {
      timestamp: new Date().toISOString(),
      status: dbStatus === "HEALTHY" ? "HEALTHY" : "DEGRADED",
      server: {
        environment: process.env.NODE_ENV || "development",
        hostingPlatform: isVercel ? "Vercel Serverless Platform" : "Node.js Dedicated Server",
        region: process.env.VERCEL_REGION || "Localhost",
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        uptime: uptimeFormatted,
        uptimeSeconds,
        memory: {
          rssMb: Math.round((memory.rss / (1024 * 1024)) * 10) / 10,
          heapUsedMb: Math.round((memory.heapUsed / (1024 * 1024)) * 10) / 10,
          heapTotalMb: Math.round((memory.heapTotal / (1024 * 1024)) * 10) / 10,
          externalMb: Math.round((memory.external / (1024 * 1024)) * 10) / 10,
        },
      },
      database: {
        status: dbStatus,
        provider: dbProvider,
        latencyMs: dbLatencyMs,
        error: dbError,
        records: {
          totalUsers,
          totalEvents,
          publishedEvents: publishedPages,
          totalPayments,
          totalResponses,
          totalThemes,
        },
      },
      storage: {
        activeProvider: activeStorageProvider,
        vercelBlobConfigured: hasVercelBlob,
        cloudinaryConfigured: hasCloudinary,
        localStorage: {
          isAvailable: !isVercel,
          uploadsDirectory: uploadsPath,
          filesCount: localUploadsCount,
          totalSizeMb: Math.round((localUploadsSizeBytes / (1024 * 1024)) * 100) / 100,
        },
        readOnlyFilesystem: isVercel,
      },
      integrations,
    };

    return NextResponse.json({ success: true, ...telemetry });
  } catch (error: any) {
    console.error("System telemetry error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to retrieve system condition telemetry.",
      },
      { status: 500 }
    );
  }
}
