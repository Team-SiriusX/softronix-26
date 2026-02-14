import { currentUser } from "@/lib/current-user";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user || (user as Record<string, unknown>).role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#f2efe9]">
      {/* Admin top bar */}
      <header className="border-b border-[#e0dcd6] bg-[#f7f4f0] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-[#1c1c1c]"
            style={{ fontFamily: "var(--font-gloock)" }}
          >
            Echo
          </Link>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#999] font-semibold">
            Admin
          </span>
        </div>
        <nav className="flex items-center gap-4 text-xs font-medium text-[#5c5c5c]">
          <Link
            href="/admin/messages"
            className="hover:text-[#1c1c1c] transition-colors"
          >
            Messages
          </Link>
          <Link
            href="/"
            className="hover:text-[#1c1c1c] transition-colors"
          >
            Back to Store
          </Link>
        </nav>
      </header>

      {/* Content */}
      <main>{children}</main>
    </div>
  );
}
