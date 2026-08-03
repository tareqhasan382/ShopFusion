import ProductListing from "@/components/UI/ProductListing";

export const metadata = {
  title: "All Products",
  description: "Browse the full ShopFusion catalog with search, filters and sorting.",
};

export const dynamic = "force-dynamic";

const page = () => <ProductListing />;

export default page;
