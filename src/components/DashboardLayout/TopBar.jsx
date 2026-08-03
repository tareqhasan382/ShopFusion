"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { navLinks } from "../../../lib/constants";
import { useAuth } from "@/Providers";

const TopBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/sign-in");
    router.refresh();
  };

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
      <Link href="/">
        <h1 className="gradient-text text-xl font-extrabold tracking-tight">
          ShopFusion
        </h1>
      </Link>

      <button
        onClick={() => setMenuOpen((prev) => !prev)}
        className="rounded-md p-2 text-slate-700 hover:bg-slate-100"
        aria-label="Toggle menu"
      >
        {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {menuOpen && (
        <div className="absolute left-4 right-4 top-16 z-40 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.url || pathname.startsWith(`${link.url}/`);
            return (
              <Link
                href={link.url}
                key={link.label}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>{link.icon}</span>
                <p>{link.label}</p>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-lg border-t border-slate-100 px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default TopBar;
