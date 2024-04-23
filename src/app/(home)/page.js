import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
export const BASEURL = "http://localhost:3000";
export default async function Home() {
  const session = await getServerSession(authOptions);
  console.log("user session:", session?.user);
  return (
    <div>
      <h1>Home Page</h1>
    </div>
  );
}
