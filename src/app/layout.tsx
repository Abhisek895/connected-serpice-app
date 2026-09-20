import type { Metadata } from "next";
import { Inter, Pacifico } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { ReferralTracker } from "@/components/ReferralTracker";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const pacifico = Pacifico({ weight: "400", subsets: ["latin"], variable: "--font-pacifico" });

// ─── Replace with your real IDs ───────────────────────────────────────────────
const GA_MEASUREMENT_ID = "G-XXXXXXXXXX";   // TODO: replace with your GA4 ID
const META_PIXEL_ID     = "XXXXXXXXXXXXXXX"; // TODO: replace with your Meta Pixel ID
// ─────────────────────────────────────────────────────────────────────────────

const baseUrl = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}` : (process.env.NEXT_PUBLIC_APP_URL || "https://ourstories.shop");

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "OurStory | Digital Memories & Proposals",
  description: "Create beautiful, interactive memory pages and proposals for your loved ones without writing any code.",
  openGraph: {
    title: "OurStory | Digital Memories & Proposals",
    description: "Create beautiful, interactive memory pages and proposals for your loved ones.",
    url: baseUrl,
    siteName: "OurStory",
    images: [`${baseUrl}/something-special-card.png`],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OurStory | Digital Memories & Proposals",
    description: "Create beautiful, interactive memory pages and proposals for your loved ones.",
    images: [`${baseUrl}/something-special-card.png`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* ── Google Fonts: Bengali & Editorial Serifs ── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Noto+Serif+Bengali:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />

        {/* ── Google Analytics GA4 ── */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>

        {/* ── Meta Pixel (Facebook / Instagram Ads) ── */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        {/* ── Razorpay Checkout SDK ── */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </head>
      <body className={`${inter.variable} ${pacifico.variable} font-sans antialiased`} suppressHydrationWarning>
        <Providers>
          <ReferralTracker />
          {children}
        </Providers>
      </body>
    </html>
  );
}
