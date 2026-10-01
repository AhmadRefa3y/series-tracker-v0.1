import Header from "@/components/header";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center bg-ink-900 text-white">
      {/* Ambient cinematic depth: soft gold/violet blooms + fine film grain.
          Sits behind the (transparent) page surfaces so every section shares
          one continuous, premium backdrop. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-48 left-1/2 h-[38rem] w-[68rem] -translate-x-1/2 rounded-full bg-primaryColor/[0.05] blur-[150px]" />
        <div className="absolute -bottom-56 right-[-10rem] h-[34rem] w-[34rem] rounded-full bg-[#8b5cf6]/[0.06] blur-[150px]" />
        <div className="absolute inset-0 grain opacity-[0.028]" />
      </div>

      <Header />

      {/* overflow-x-clip (not hidden) so descendant `position: sticky`
          elements keep sticking to the viewport. */}
      <div className="relative flex min-h-[calc(100vh-4rem)] w-full flex-1 flex-col overflow-x-clip">
        {children}
        <Toaster richColors />
      </div>
    </div>
  );
}
