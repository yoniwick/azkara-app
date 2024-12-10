import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Azkara",
  icons: "/images/favicon.ico",
}

// Either use montserrat font
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/Logo.png" sizes="any" />
        <link rel="apple-touch-icon" href="/images/Logo.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/images/Logo.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/images/Logo.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>{children}</body>
    </html>
  )
}

// Or remove it if not needed by removing the import
