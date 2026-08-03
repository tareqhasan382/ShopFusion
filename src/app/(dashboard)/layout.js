import LeftSideBar from "@/components/DashboardLayout/LeftSideBar";
import "../globals.css";
import { Inter } from "next/font/google";
import TopBar from "@/components/DashboardLayout/TopBar";
import { AuthProvider } from "@/Providers";
const inter = Inter({ subsets: ["latin"] });
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getSession } from "@lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard",
  description: "ShopFusion admin dashboard",
};

export default async function AdminLayout({ children }) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/sign-in");
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${inter.className} min-h-screen bg-slate-50`}>
        <AuthProvider>
          <ToastContainer position="bottom-right" theme="light" />
          <div className="flex min-h-screen max-lg:flex-col lg:h-screen">
            <LeftSideBar />
            <div className="flex min-w-0 flex-1 flex-col lg:overflow-hidden">
              <TopBar />
              <main className="mx-auto w-full max-w-7xl min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                {children}
              </main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
