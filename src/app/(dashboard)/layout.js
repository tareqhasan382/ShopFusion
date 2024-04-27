import LeftSideBar from "@/components/DashboardLayout/LeftSideBar";
import "../globals.css";
import { Inter } from "next/font/google";
import TopBar from "@/components/DashboardLayout/TopBar";
import { AuthProvider } from "@/Providers";
const inter = Inter({ subsets: ["latin"] });
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
export const metadata = {
  title: "Dashboard",
  description: "e-commerce-Dashboard-Page",
};

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session?.user?.role !== "admin") redirect("/sign-in");
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={inter.className}>
        <AuthProvider>
          <ToastContainer />
          <div className=" w-full flex max-lg:flex-col ">
            <div className=" bg-white sticky top-0 z-50">
              <LeftSideBar />
              <TopBar />
            </div>
            <div className=" w-full flex-1 p-5 items-center justify-center ">
              {children}
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
