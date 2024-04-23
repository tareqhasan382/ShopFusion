import LeftSideBar from "@/components/DashboardLayout/LeftSideBar";
import "../globals.css";
import { Inter } from "next/font/google";
import TopBar from "@/components/DashboardLayout/TopBar";
import { AuthProvider } from "@/Providers";
const inter = Inter({ subsets: ["latin"] });
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export const metadata = {
  title: "Dashboard",
  description: "e-commerce-Dashboard-Page",
};

export default function AdminLayout({ children }) {
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
