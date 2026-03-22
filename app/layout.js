import "./globals.css";

const siteUrl = "https://www.seasonalproduce.club";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: "SEASONAL PRODUCE",
  description:
    "Seasonal Produce party line. Text for the next party location, date, and sunset start time.",
  applicationName: "SEASONAL PRODUCE",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "SEASONAL PRODUCE",
    description:
      "Text the party line to get the next party location, date, and sunset start time.",
    type: "website",
    siteName: "SEASONAL PRODUCE",
    url: siteUrl,
    images: [
      {
        url: `${siteUrl}/og_image.png`,
        width: 1024,
        height: 536,
        alt: "Seasonal Produce party artwork",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SEASONAL PRODUCE",
    description:
      "Text the party line to get the next party location, date, and sunset start time.",
    images: [`${siteUrl}/og_image.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
