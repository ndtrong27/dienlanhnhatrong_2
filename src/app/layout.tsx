import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import FloatingAndModalShell from "@/components/FloatingAndModalShell";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://dienlanhnhatrong2.vercel.app"),
  title: "Vệ Sinh, Sửa Máy Lạnh Thủ Đức Có Mặt Sau 30P | AirCool Pro",
  description:
    "Chuyên vệ sinh, sửa chữa, tháo lắp máy lạnh tại TP. Thủ Đức. Thợ giỏi có chứng chỉ, phục vụ 24/7, báo giá minh bạch không phát sinh, bảo hành 6-12 tháng.",
  verification: {
    google: "4g02FR38vjUnDzmUzK5Gz_rfXYgVomOHMHNYmazRYJo",
  },
  alternates: {
    canonical: "https://dienlanhnhatrong2.vercel.app/",
  },
};

export const viewport: Viewport = {
  themeColor: "#0891b2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Poppins:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-VZSHJ1L8KY"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-VZSHJ1L8KY');
          `}
        </Script>
      </head>
      <body>
        {children}
        <FloatingAndModalShell />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
