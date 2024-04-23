import "../globals.css";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export const metadata = {
  title: "Authentication",
  description: "e-commerce-Dashboard-Page",
};

export default function AuthLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={inter.className}>
        <div>
          <ToastContainer />
          {children}
        </div>
      </body>
    </html>
  );
}
