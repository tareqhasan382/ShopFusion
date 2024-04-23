import { Inter } from "next/font/google";
import "../globals.css";
import { AuthProvider } from "@/Providers";
import Navbar from "@/components/Navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "@/components/Footer";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Home Page",
  description: "Home page",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ToastContainer />
          <main>
            <div className=" w-screen sticky top-0 z-50 bg-slate-200 text-black ">
              <Navbar />
            </div>
            <div className="flex flex-col bg-white text-black w-[100vw] overflow-x-hidden items-center ">
              {children}
            </div>
          </main>
          <div className=" w-screen bg-slate-200 text-black ">
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
