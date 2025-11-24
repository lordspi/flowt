import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flowt AI 4.0 - Shake up your creativity with image generation",
  description:
    "AI-powered image generation platform for Comics, Posters, and more. Create stunning visuals with Flowt AI.",
  keywords:
    "AI image generation, Flowt, Comics creator, Poster design",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
