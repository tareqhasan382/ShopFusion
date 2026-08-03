"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, ChevronsLeft } from "lucide-react";
import { navLinks } from "../../../lib/constants";
import { useAuth } from "@/Providers";

const LeftSideBar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/sign-in");
    router.refresh();
  };

  return (
    <aside
      className={`relative sticky top-0 hidden h-screen shrink-0 flex-col border-r border-slate-800 bg-slate-900 transition-[width] duration-200 lg:flex ${
        collapsed ? "w-[4.5rem]" : "w-64"
      }`}
    >
      <button
        onClick={() => setCollapsed((prev) => !prev)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={`absolute right-0 top-1/2 z-20 flex h-6 w-6 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-slate-600 bg-slate-800 text-slate-300 shadow-lg shadow-black/40 transition-all duration-150 hover:border-indigo-400 hover:bg-indigo-600 hover:text-white ${
          collapsed ? "rotate-180" : ""
        }`}
      >
        <ChevronsLeft className="h-3.5 w-3.5" />
      </button>

      <div
        className={`flex items-center ${
          collapsed
            ? "justify-center px-3 py-4"
            : "justify-between px-6 pb-4 pt-6"
        }`}
      >
        <Link href="/" className="block min-w-0">
          {collapsed ? (
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-sm font-extrabold text-white shadow-lg shadow-indigo-900/40">
              SF
            </span>
          ) : (
            <h1 className="gradient-text text-2xl font-extrabold tracking-tight">
              ShopFusion
            </h1>
          )}
        </Link>
      </div>

      <nav
        className={`sidebar-scroll flex-1 overflow-y-auto overscroll-contain ${
          collapsed ? "space-y-2 px-3 py-1" : "space-y-1 px-3 py-2"
        }`}
      >
        {navLinks.map((link) => {
          const isActive =
            pathname === link.url || pathname.startsWith(`${link.url}/`);
          return (
            <Link
              href={link.url}
              key={link.label}
              title={link.label}
              className={`flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                collapsed ? "h-10 justify-center px-0" : "px-3"
              } ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/30"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="shrink-0">{link.icon}</span>
              {!collapsed && <p className="truncate">{link.label}</p>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-3 pt-4">
        <div
          className={`flex items-center gap-3 ${
            collapsed ? "justify-center" : "px-1.5"
          }`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white ring-2 ring-slate-700">
            {(user?.name || "A")
              .split(" ")
              .map((part) => part[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {user?.name}
              </p>
              <p className="truncate text-xs text-slate-500">{user?.role}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          title="Sign out"
          className={`mt-3 flex w-full items-center gap-3 rounded-lg py-2.5 text-sm font-medium text-rose-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300 ${
            collapsed ? "justify-center px-0" : "px-3"
          }`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
};

export default LeftSideBar;
