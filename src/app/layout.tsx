import type { Metadata } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const bodyFont = Geist({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Source_Serif_4({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CareerGPS4u — Interview-ready for Singapore, Malaysia & Myanmar",
  description:
    "CareerGPS4u helps students and fresh graduates prep for interviews, tailor resumes, and close skill gaps for the Singapore, Malaysia, and Myanmar job markets.",
  openGraph: {
    title: "CareerGPS4u",
    description:
      "Interview-ready for the market you're actually walking into — Singapore, Malaysia, Myanmar.",
    images: ["/logo-full.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${displayFont.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="bg-blobs" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
