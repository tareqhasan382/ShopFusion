import Messages from "@/components/Dashboard/Messages";

export const metadata = { title: "Messages | ShopFusion Admin" };

const page = () => (
  <div>
    <div className="mb-6">
      <h1 className="page-title">Contact Messages</h1>
    </div>
    <Messages />
  </div>
);

export default page;
