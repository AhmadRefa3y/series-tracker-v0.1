import type { Metadata } from "next";
import { Josefin_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";

const josefin_Sans = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400"],
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
        className={`${josefin_Sans.className} antialiased capitalize overflow-y-scroll `}
      >
        <SessionProvider session={session} key={session?.user?.id}>
          <Providers>{children}</Providers>
        </SessionProvider>
      </body>
    </html>
  );
}
