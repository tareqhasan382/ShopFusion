"use client";
import { useEffect, useRef, useState } from "react";
import { ShoppingCart, Heart, Menu, X, ChevronDown, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/Providers";
import useCart from "@/store/useCart";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Collections", href: "/collections" },
  { label: "Products", href: "/products" },
  { label: "Orders", href: "/orders" },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const cart = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const searchRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    const query = searchInput.trim();
    router.push(query ? `/products?search=${encodeURIComponent(query)}` : "/products");
    setSearchInput("");
    setSearchOpen(false);
  };

  const cartCount = mounted ? cart.cartItems.length : 0;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
      <div className="relative flex items-center justify-between py-4">
        <div className="flex items-center gap-8">
          <Link href="/">
            <span className="gradient-text text-2xl font-extrabold tracking-tight">
              ShopFusion
            </span>
          </Link>

          <nav className="hidden items-center md:flex">
            <ul className="flex items-center gap-1 text-sm font-medium">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`rounded-full px-3 py-2 transition-colors ${
                      pathname === link.href
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {user?.role === "admin" && (
                <li>
                  <Link
                    href="/admin"
                    className={`rounded-full px-3 py-2 transition-colors ${
                      pathname.startsWith("/admin")
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    Dashboard
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="relative" ref={searchRef}>
            <button
              onClick={() => setSearchOpen((prev) => !prev)}
              aria-label="Search"
              className="rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <Search className="h-5 w-5" />
            </button>
            {searchOpen && (
              <form
                onSubmit={submitSearch}
                className="absolute right-0 top-12 z-50 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
              >
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search products…"
                  className="input-field"
                  autoFocus
                />
              </form>
            )}
          </div>

          <Link
            href={user ? "/wishlist" : "/sign-in"}
            aria-label="Wishlist"
            className="relative rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-rose-600"
          >
            <Heart className="h-5 w-5" />
          </Link>

          <Link
            href="/cart"
            aria-label="Cart"
            className="relative rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <ShoppingCart className="h-5 w-5" />
            {mounted && cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-slate-100"
                aria-expanded={menuOpen}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  {initials || "U"}
                </span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                  <div className="border-b border-slate-100 px-3 py-2.5">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                  </div>
                  <Link
                    href="/orders"
                    className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/wishlist"
                    className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    Wishlist
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-600 hover:bg-rose-50"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/sign-in" className="btn-primary hidden !px-4 !py-2 sm:inline-flex">
              Sign in
            </Link>
          )}

          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="rounded-md p-2 text-slate-700 hover:bg-slate-100 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-100 py-3 md:hidden">
          <ul className="space-y-1 text-sm font-medium">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-lg px-3 py-2.5 text-slate-700 hover:bg-slate-100"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {user?.role === "admin" && (
              <li>
                <Link
                  href="/admin"
                  className="block rounded-lg px-3 py-2.5 text-slate-700 hover:bg-slate-100"
                >
                  Dashboard
                </Link>
              </li>
            )}
            <li className="border-t border-slate-100 pt-1">
              {user ? (
                <div className="px-3 py-2.5">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-slate-500">{user.email}</p>
                </div>
              ) : (
                <Link
                  href="/sign-in"
                  className="block rounded-lg px-3 py-2.5 text-slate-700 hover:bg-slate-100"
                >
                  Sign in
                </Link>
              )}
            </li>
            {user && (
              <li>
                <button
                  onClick={handleLogout}
                  className="block w-full rounded-lg px-3 py-2.5 text-left text-rose-600 hover:bg-rose-50"
                >
                  Sign out
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;
