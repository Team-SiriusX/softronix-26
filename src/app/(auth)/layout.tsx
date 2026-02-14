import { Spotlight } from "@/components/spotlight";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#f2efe9] antialiased selection:bg-[#1c1c1c] selection:text-[#f2efe9]">
      {/* Subtle Grid Background */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 select-none [background-size:40px_40px] opacity-[0.03]",
          "[background-image:linear-gradient(to_right,#1c1c1c_1px,transparent_1px),linear-gradient(to_bottom,#1c1c1c_1px,transparent_1px)]",
        )}
      />

      {/* Logo/Header */}
      <div className="absolute left-8 top-8 z-50">
        <Link
          href="/"
          className="group flex items-center gap-3 border border-[#1c1c1c]/10 bg-[#f2efe9] px-4 py-2 backdrop-blur-sm transition-all hover:border-[#1c1c1c]/40"
        >
          <span className="font-gloock text-xl tracking-wider text-[#1c1c1c]">
            ECHO
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
