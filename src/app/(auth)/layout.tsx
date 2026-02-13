import { Spotlight } from "@/components/spotlight";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black/[0.96] antialiased">
      {/* Grid Background */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 select-none [background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,#171717_1px,transparent_1px),linear-gradient(to_bottom,#171717_1px,transparent_1px)]",
        )}
      />

      {/* Spotlight Effects */}
      <Spotlight
        className="-top-40 left-0 md:-top-20 md:left-60"
        fill="white"
      />
      <Spotlight
        className="-top-40 right-0 md:-top-20 md:right-60"
        fill="white"
        mirror={true}
      />

      {/* Logo/Header */}
      <div className="absolute left-8 top-8 z-50">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-xl bg-blue-500/10 px-4 py-2 backdrop-blur-sm transition-all hover:bg-blue-500/20 border border-blue-500/20"
        >
          <span className="text-xl font-bold tracking-wider text-white">
            ENTROPY
          </span>
        </Link>
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 pt-24 md:pt-4">
        {children}
      </div>
    </div>
  );
}
