import Link from "next/link";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import NewsletterForm from "@/components/NewsletterForm";

const shopLinks = [
  { label: "Collections", href: "/collections" },
  { label: "Products", href: "/products" },
  { label: "Cart", href: "/cart" },
  { label: "Wishlist", href: "/wishlist" },
];

const accountLinks = [
  { label: "Sign in", href: "/sign-in" },
  { label: "Create account", href: "/sign-up" },
  { label: "My Profile", href: "/profile" },
  { label: "My Orders", href: "/orders" },
  { label: "Contact Us", href: "/contact" },
  { label: "Dashboard", href: "/admin" },
];

const socials = [
  { label: "Facebook", icon: Facebook, href: "#" },
  { label: "Instagram", icon: Instagram, href: "#" },
  { label: "Twitter", icon: Twitter, href: "#" },
  { label: "LinkedIn", icon: Linkedin, href: "#" },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t border-slate-800 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="gradient-text text-2xl font-extrabold tracking-tight">
              ShopFusion
            </h3>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Your one-stop destination for quality products, curated
              collections and a delightful shopping experience.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white">
              Shop
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white">
              Account
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {accountLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white">
              Stay in the loop
            </h4>
            <p className="mt-4 text-sm text-slate-400">
              Subscribe for new arrivals, exclusive offers and style tips. No
              spam, unsubscribe anytime.
            </p>
            <div className="mt-4">
              <NewsletterForm />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white">
              Follow us
            </h4>
            <div className="mt-4 flex gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition-colors hover:bg-indigo-600 hover:text-white"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-800 pt-6 text-sm text-slate-500 sm:flex-row">
          <p>
            © {currentYear} ShopFusion. All rights reserved.
          </p>
          <p>Built with Next.js · Secure payments by Stripe</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
