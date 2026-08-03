import { getSession } from "@lib/auth";
import SignUpForm from "@/components/SignUpForm";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Create Account",
};

const SignUpPage = async () => {
  const session = await getSession();
  if (session) redirect("/");
  return <SignUpForm />;
};

export default SignUpPage;
