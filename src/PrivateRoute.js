import { getServerSession } from "next-auth";
import { authOptions } from "./app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

const PrivateRoute = async ({ children }) => {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return children;
};

export default PrivateRoute;
