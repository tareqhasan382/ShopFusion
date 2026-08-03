import SettingsForm from "@/components/Dashboard/SettingsForm";

export const metadata = { title: "Store Settings | ShopFusion Admin" };

const page = () => (
  <div>
    <div className="mb-6">
      <h1 className="page-title">Store Settings</h1>
    </div>
    <SettingsForm />
  </div>
);

export default page;
