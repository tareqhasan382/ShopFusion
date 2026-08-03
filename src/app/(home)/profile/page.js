import { getSession } from "@lib/auth";
import { connectMongodb } from "@lib/mongodb";
import UserModel from "@lib/models/UserModel";
import { redirect } from "next/navigation";
import ProfileClient from "@/components/ProfileClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Account | ShopFusion",
  description: "Manage your ShopFusion account, addresses and password.",
};

const Profile = async () => {
  const session = await getSession();
  if (!session) redirect("/sign-in?next=/profile");

  await connectMongodb();
  const user = await UserModel.findById(session.id).lean();

  if (!user) redirect("/sign-in?next=/profile");

  return (
    <ProfileClient
      user={{
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        phone: user.phone || "",
        avatar: user.avatar || "",
        addresses: (user.addresses || []).map((a) => ({ ...a, _id: String(a._id || "") })),
      }}
    />
  );
};

export default Profile;
