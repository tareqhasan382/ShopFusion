import { getSession } from "@lib/auth";
import SignInForm from "@/components/SignInForm";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Sign In",
};

const SignInPage = async ({ searchParams }) => {
  const session = await getSession();
  if (session) redirect("/");
  return <SignInForm next={searchParams?.next} />;
};

export default SignInPage;
