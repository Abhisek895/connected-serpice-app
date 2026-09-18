import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Database } from "lucide-react";
import UploadsTabs from "./UploadsTabs";
import { list } from "@vercel/blob";

export const metadata = {
  title: "User Uploads & Storage Explorer | OurStory Admin",
};

export default async function AdminUploadsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "super_admin") {
    redirect("/admin/overview");
  }

  // 1. Fetch all users who have created events, including those events and their media
  const usersWithEvents = await prisma.user.findMany({
    where: {
      events: {
        some: {}, // Only fetch users who have at least one event
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      events: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          theme: {
            select: {
              name: true,
              title: true,
            },
          },
          media: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc", // Order users by newest first
    },
  });

  // 2. Fetch all raw blobs from Vercel Cloud Storage
  let allBlobs: any[] = [];
  try {
    const blobToken =
      process.env.BLOB_READ_WRITE_TOKEN ||
      Object.entries(process.env).find(([k]) => k.endsWith("_READ_WRITE_TOKEN"))?.[1];

    if (blobToken) {
       // Note: list() has a limit. By default it fetches up to 1000 items.
       // Since this is for the admin gallery, fetching the first 1000 is usually enough for a dashboard view.
       const { blobs } = await list({ token: blobToken });
       allBlobs = blobs;
    }
  } catch (error) {
    console.error("Failed to fetch blobs for admin dashboard:", error);
  }

  return (
    <div className="p-4 sm:p-8 w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <Database className="w-6 h-6 text-indigo-400" />
            Uploads & Storage Explorer
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track templates data or browse every single file currently sitting in the cloud storage bucket.
          </p>
        </div>
      </div>

      {/* Tabs Wrapper (Handles switching between User Templates and Raw Blobs) */}
      <UploadsTabs usersData={usersWithEvents} blobs={allBlobs} />
    </div>
  );
}
