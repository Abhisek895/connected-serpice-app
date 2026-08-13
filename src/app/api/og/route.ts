import React from "react";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title") || "A Surprise For You... 😊";
    const recipient = searchParams.get("recipient") || "Someone Special ✨";

    const containerStyle: any = {
      height: "100%",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundImage: "linear-gradient(to bottom right, #1e1b4b, #831843, #0f172a)",
      position: "relative",
      fontFamily: "sans-serif",
      padding: "40px",
    };

    const badgeStyle: any = {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      borderRadius: "50px",
      padding: "10px 24px",
      color: "#fecdd3",
      fontSize: "20px",
      fontWeight: 700,
      marginBottom: "24px",
    };

    const titleStyle: any = {
      fontSize: "52px",
      fontWeight: 900,
      color: "#ffffff",
      textAlign: "center",
      lineHeight: "1.2",
      marginBottom: "20px",
      maxWidth: "900px",
    };

    const recipientStyle: any = {
      fontSize: "28px",
      fontWeight: 700,
      color: "#fb7185",
      marginBottom: "36px",
    };

    const ctaStyle: any = {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      backgroundColor: "#f43f5e",
      color: "#ffffff",
      padding: "16px 36px",
      borderRadius: "40px",
      fontSize: "22px",
      fontWeight: 800,
    };

    return new ImageResponse(
      React.createElement(
        "div",
        { style: containerStyle },
        React.createElement("div", { key: "b", style: badgeStyle }, "🎁 Something Special For You 🎁"),
        React.createElement("div", { key: "t", style: titleStyle }, title),
        React.createElement("div", { key: "r", style: recipientStyle }, `For ${recipient} ❤️`),
        React.createElement("div", { key: "c", style: ctaStyle }, "💌 Tap Here To Open Your Surprise ➔")
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
