
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get("image");
    
    // Construct the absolute URL for the image
    const protocol = req.headers.get("x-forwarded-proto") || "https";
    const host = req.headers.get("host") || "ourstories.shop";
    const baseUrl = `${protocol}://${host}`;
    
    let fullImageUrl = "";
    if (imageUrl) {
      fullImageUrl = imageUrl.startsWith("http") ? imageUrl : `${baseUrl}${imageUrl}`;
    }

    const text = "LOVE YOU ".repeat(1500);

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            backgroundColor: "#000000",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Base Image */}
          {fullImageUrl && (
            <img
              src={fullImageUrl}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 0.6,
              }}
            />
          )}

          {/* Text Art Overlay */}
          <div
            style={{
              position: "absolute",
              top: "-10%",
              left: "-10%",
              width: "120%",
              height: "120%",
              display: "flex",
              color: "rgba(255, 255, 255, 0.8)",
              fontSize: "12px",
              fontWeight: 900,
              lineHeight: 1,
              flexWrap: "wrap",
              overflow: "hidden",
            }}
          >
            {text}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error("OG Image generation failed:", e);
    return new Response("Failed to generate OG image", { status: 500 });
  }
}
