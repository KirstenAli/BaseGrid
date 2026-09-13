import { headers } from "next/headers";
import "./globals.css";

const title = "BaseGrid — Private OpenStack cloud";
const description = "A precisely allocated private cloud for focused teams.";

export async function generateMetadata() {
  const origin = await requestOrigin();
  const image = `${origin}/og.png`;
  return { title, description, openGraph: { title, description, images: [{ url: image, width: 1672, height: 941 }] }, twitter: { card: "summary_large_image", title, description, images: [image] } };
}

async function requestOrigin() {
  const values = await headers();
  const host = values.get("x-forwarded-host") || values.get("host") || "localhost:3000";
  const protocol = values.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  return `${protocol === "http" ? "http" : "https"}://${host}`;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
