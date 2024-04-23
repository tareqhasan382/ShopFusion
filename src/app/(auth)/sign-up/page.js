import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import SignUpForm from "@/components/SignUpForm";
import { getServerSession } from "next-auth";
import React from "react";
import { redirect } from "next/navigation";
const page = async () => {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/");
  return <SignUpForm />;
};

export default page;
