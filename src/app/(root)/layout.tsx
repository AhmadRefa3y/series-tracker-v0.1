import Header from "@/components/header";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-[#1a1a1a]">
      <Header />
      <div className="w-full flex-1 flex flex-col min-h-[calc(100vh-4rem)] overflow-x-hidden">
        {children}
        <Toaster richColors />
      </div>
    </div>
  );
}
