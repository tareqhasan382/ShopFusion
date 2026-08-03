import {
    LayoutDashboard,
    Shapes,
    ShoppingBag,
    Tag,
    UsersRound,
    FolderTree,
    Sparkles,
    PackageCheck,
    TicketPercent,
    Star,
    Inbox,
    ScrollText,
    Settings,
    Mail,
  } from "lucide-react";
  
  export const navLinks = [
    {
      url: "/admin",
      icon: <LayoutDashboard />,
      label: "Dashboard",
    },
    {
      url: "/admin/collections",
      icon: <Shapes />,
      label: "Collections",
    },
    {
      url: "/admin/categories",
      icon: <FolderTree />,
      label: "Categories",
    },
    {
      url: "/admin/brands",
      icon: <Sparkles />,
      label: "Brands",
    },
    {
      url: "/admin/products",
      icon: <Tag />,
      label: "Products",
    },
    {
      url: "/admin/inventory",
      icon: <PackageCheck />,
      label: "Inventory",
    },
    {
      url: "/admin/coupons",
      icon: <TicketPercent />,
      label: "Coupons",
    },
    {
      url: "/admin/orders",
      icon: <ShoppingBag />,
      label: "Orders",
    },
    {
      url: "/admin/customers",
      icon: <UsersRound />,
      label: "Customers",
    },
    {
      url: "/admin/reviews",
      icon: <Star />,
      label: "Reviews",
    },
    {
      url: "/admin/messages",
      icon: <Inbox />,
      label: "Messages",
    },
    {
      url: "/admin/newsletter",
      icon: <Mail />,
      label: "Newsletter",
    },
    {
      url: "/admin/audit",
      icon: <ScrollText />,
      label: "Audit Logs",
    },
    {
      url: "/admin/settings",
      icon: <Settings />,
      label: "Settings",
    },
  ];