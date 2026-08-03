import { connectMongodb } from "@lib/mongodb";
import UserModel from "@lib/models/UserModel";
import { MailCheck, MailX2 } from "lucide-react";
import Link from "next/link";
import AuthShell from "@/components/AuthShell";

export const dynamic = "force-dynamic";

const VerifyEmail = async ({ searchParams }) => {
  const token = searchParams?.token;

  let status = "invalid";
  let message = "This verification link is invalid or has expired.";

  if (token && typeof token === "string") {
    try {
      await connectMongodb();
      const user = await UserModel.findOne({
        verificationToken: token,
        verificationTokenExpires: { $gt: new Date() },
      }).select("+verificationToken +verificationTokenExpires");

      if (user) {
        user.emailVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();
        status = "verified";
        message = "Your email has been verified successfully.";
      }
    } catch (error) {
      console.error("[verify-email]", error);
    }
  }

  const success = status === "verified";

  return (
    <AuthShell>
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        {success ? (
          <MailCheck className="h-14 w-14 text-emerald-500" />
        ) : (
          <MailX2 className="h-14 w-14 text-rose-500" />
        )}
        <h1 className="text-2xl font-bold text-slate-900">
          {success ? "Email Verified" : "Verification Failed"}
        </h1>
        <p className="max-w-sm text-slate-500">{message}</p>
        <Link href={success ? "/profile" : "/sign-in"} className="btn-primary mt-2">
          {success ? "Go to my account" : "Sign in"}
        </Link>
      </div>
    </AuthShell>
  );
};

export default VerifyEmail;
