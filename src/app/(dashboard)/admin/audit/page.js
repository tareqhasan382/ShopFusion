import AuditLogs from "@/components/Dashboard/AuditLogs";

export const metadata = { title: "Audit Logs | ShopFusion Admin" };

const page = () => (
  <div className="flex h-full flex-col">
    <div className="mb-6 shrink-0">
      <h1 className="page-title">Audit Logs</h1>
    </div>
    <div className="min-h-0 flex-1">
      <AuditLogs />
    </div>
  </div>
);

export default page;
