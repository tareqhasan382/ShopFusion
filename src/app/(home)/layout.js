import { Inter } from "next/font/google";
import "../globals.css";
import { AuthProvider } from "@/Providers";
import Navbar from "@/components/Navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: {
    default: "ShopFusion",
    template: "%s | ShopFusion",
  },
  description: "ShopFusion — modern e-commerce for every style.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex min-h-screen flex-col bg-white`}>
        <AuthProvider>
          <ToastContainer position="bottom-right" theme="light" />
          <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
            <Navbar />
          </header>
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
