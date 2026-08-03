import "../globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/Providers";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ShopFusion",
  description: "Sign in or create your ShopFusion account.",
};

export default function AuthLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${inter.className} min-h-screen bg-slate-50`}>
        <AuthProvider>
          <ToastContainer position="bottom-right" theme="light" />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
