import type { Metadata } from "next";
import { Josefin_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";

// Load the full weight range so `font-semibold`/`font-black` render real
// weights instead of browser-synthesised faux-bold — a big jump in polish.
const josefin_Sans = Josefin_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-josefin",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sennit",
  description: "Track your favorite shows ",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body
        className={`${josefin_Sans.variable} ${josefin_Sans.className} bg-ink-950 antialiased capitalize overflow-y-scroll`}
      >
        <SessionProvider session={session} key={session?.user?.id}>
          <Providers>{children}</Providers>
        </SessionProvider>
      </body>
    </html>
  );
}
