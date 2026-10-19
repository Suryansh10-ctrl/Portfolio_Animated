import type { Metadata, Viewport } from "next";
import { portfolio } from "@/lib/portfolio";
import "./globals.css";

export const metadata: Metadata = {
  title: `${portfolio.person.name} — ${portfolio.collectionEdition}`,
  description: `${portfolio.person.role} · ${portfolio.person.bio}`,
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: `${portfolio.person.name} — ${portfolio.collectionTitle}`,
    description: portfolio.person.bio,
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#171a24",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning={true} lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
