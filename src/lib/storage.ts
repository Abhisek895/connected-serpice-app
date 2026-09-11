import { put, del } from "@vercel/blob";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

export interface StorageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
  provider?: "vercel-blob" | "cloudinary" | "local";
}

/**
 * Unified Cloud Media Storage Adapter
 * Automatically routes file uploads to:
 * 1. Vercel Blob (if BLOB_READ_WRITE_TOKEN is present)
 * 2. Cloudinary (if CLOUDINARY_URL or credentials present)
 * 3. Local filesystem (if running in local dev)
 */
export async function uploadToStorage(
  buffer: Buffer,
  originalFilename: string,
  mimeType: string,
  folder: string = "uploads"
): Promise<StorageUploadResult> {
  const ext = (
    originalFilename.split(".").pop() ||
    (mimeType.startsWith("audio/") ? "mp3" : "jpg")
  ).toLowerCase();
  const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const pathName = `${folder}/${uniqueName}`;
  
  // Standardize audio and image MIME types so browsers (especially iOS Safari) stream without error
  let cleanContentType = mimeType;
  if (!cleanContentType || cleanContentType === "application/octet-stream" || cleanContentType === "audio/mp3") {
    if (ext === "mp3") cleanContentType = "audio/mpeg";
    else if (ext === "m4a") cleanContentType = "audio/mp4";
    else if (ext === "wav") cleanContentType = "audio/wav";
    else if (ext === "ogg") cleanContentType = "audio/ogg";
    else if (ext === "webp") cleanContentType = "image/webp";
    else if (ext === "png") cleanContentType = "image/png";
    else cleanContentType = "image/jpeg";
  }

  // ── 1. Vercel Blob Storage (supports both modern Vercel OIDC and BLOB_READ_WRITE_TOKEN) ──
  const blobToken =
    process.env.BLOB_READ_WRITE_TOKEN ||
    Object.entries(process.env).find(([k]) => k.endsWith("_READ_WRITE_TOKEN"))?.[1];

  const hasBlobConfig =
    Boolean(blobToken) ||
    Boolean(process.env.BLOB_STORE_ID) ||
    Object.keys(process.env).some((k) => k.endsWith("_STORE_ID"));

  if (hasBlobConfig) {
    try {
      const options: any = {
        access: "public",
        contentType: cleanContentType,
      };
      if (blobToken) {
        options.token = blobToken;
      }
      const blob = await put(pathName, buffer, options);
      return {
        success: true,
        url: blob.url,
        provider: "vercel-blob",
      };
    } catch (err: any) {
      console.error("[Storage] Vercel Blob upload failed:", err);
      // Fall through to other options if available
    }
  }

  // ── 2. Cloudinary REST API ──
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudinaryUrl || (cloudName && apiKey && apiSecret)) {
    try {
      let resolvedCloudName = cloudName;
      let authHeader = "";

      if (cloudinaryUrl) {
        // Format: cloudinary://api_key:api_secret@cloud_name
        const match = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
        if (match) {
          const [, key, secret, name] = match;
          resolvedCloudName = name;
          authHeader = "Basic " + Buffer.from(`${key}:${secret}`).toString("base64");
        }
      } else if (apiKey && apiSecret) {
        authHeader = "Basic " + Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
      }

      if (resolvedCloudName) {
        const resourceType = mimeType.startsWith("audio/") ? "video" : "auto";
        const formData = new FormData();
        const blobData = new Blob([new Uint8Array(buffer)], { type: mimeType });
        formData.append("file", blobData, originalFilename);
        formData.append("folder", folder);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${resolvedCloudName}/${resourceType}/upload`,
          {
            method: "POST",
            headers: authHeader ? { Authorization: authHeader } : undefined,
            body: formData,
          }
        );

        if (res.ok) {
          const data = await res.json();
          if (data.secure_url) {
            return {
              success: true,
              url: data.secure_url,
              provider: "cloudinary",
            };
          }
        } else {
          const errText = await res.text();
          console.error("[Storage] Cloudinary error response:", errText);
        }
      }
    } catch (err: any) {
      console.error("[Storage] Cloudinary upload failed:", err);
    }
  }

  // ── 3. Local Filesystem (Active whenever running outside of serverless read-only cloud) ──
  const isVercel = Boolean(process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV);

  if (!isVercel) {
    try {
      const uploadDir = path.join(process.cwd(), "public", folder);
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, uniqueName), buffer);
      return {
        success: true,
        url: `/${folder}/${uniqueName}`,
        provider: "local",
      };
    } catch (err: any) {
      console.error("[Storage] Local filesystem write failed:", err);
    }
  }

  // ── 4. Serverless Production without Storage Keys Configured ──
  return {
    success: false,
    error:
      "Cloud storage is not configured on this server. Please enable Vercel Blob in your Vercel Dashboard (Storage -> Create Blob) or set BLOB_READ_WRITE_TOKEN / CLOUDINARY_URL in your environment variables.",
  };
}

/**
 * Automatically deletes a file from Vercel Blob Cloud Storage or local filesystem
 */
export async function deleteFromStorage(url: string): Promise<boolean> {
  if (!url) return false;

  // 1. Vercel Blob URL deletion
  if (url.includes(".blob.vercel-storage.com")) {
    try {
      const blobToken =
        process.env.BLOB_READ_WRITE_TOKEN ||
        Object.entries(process.env).find(([k]) => k.endsWith("_READ_WRITE_TOKEN"))?.[1];

      await del(url, blobToken ? { token: blobToken } : undefined);
      return true;
    } catch (err: any) {
      console.error("[Storage] Vercel Blob delete failed:", err);
      return false;
    }
  }

  // 2. Local filesystem deletion
  if (url.startsWith("/uploads/")) {
    try {
      const filePath = path.join(process.cwd(), "public", url);
      await unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

