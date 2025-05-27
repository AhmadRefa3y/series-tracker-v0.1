import Header from "@/components/header";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-[#1d1d1d]">
      <Header />
      <div className=" w-full flex-1 flex flex-col">
        {children}
        <Toaster richColors />
      </div>
    </div>
  );
}
