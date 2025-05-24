import Header from "@/components/header";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col items-center  bg-black text-white min-h-screen ">
      <Header />
      <div className="bg-[#ffffff] w-full flex-1 flex flex-col  ">
        {children}
        <Toaster richColors />
      </div>
    </div>
  );
}
