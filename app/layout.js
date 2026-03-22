import "./globals.css";

export const metadata = {
  title: "SEASONAL PRODUCE",
  description: "Twilio-powered party line deployed on Vercel.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
