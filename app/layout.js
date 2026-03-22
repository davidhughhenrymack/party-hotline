import "./globals.css";

export const metadata = {
  title: "SEASONAL PRODUCE",
  description: "Twilio-powered party line deployed on Vercel.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
