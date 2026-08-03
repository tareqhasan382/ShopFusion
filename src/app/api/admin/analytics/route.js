import OrderModel from "../../../../../lib/models/OrderModel";
import ProductModel from "../../../../../lib/models/ProductModel";
import CustomerModel from "../../../../../lib/models/CustomerModel";
import { getStoreSettings } from "../../../../../lib/models/StoreSettingModel";
import { connectMongodb } from "../../../../../lib/mongodb";
import { getSessionFromRequest } from "../../../../../lib/auth";
import { jsonError, jsonSuccess } from "../../../../../lib/apiResponse";
import { getPaymentStatus } from "../../../../../lib/orderStatus";

export const GET = async (req) => {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return jsonError("Unauthorized.", 401);
  }

  try {
    await connectMongodb();

    const [orders, customers, allProducts] = await Promise.all([
      OrderModel.find().lean(),
      CustomerModel.countDocuments(),
      ProductModel.find({ isDeleted: { $ne: true } })
        .select("title price media category stock")
        .lean(),
    ]);

    const paidOrders = orders.filter(
      (order) => getPaymentStatus(order) === "paid"
    );
    const totalOrders = paidOrders.length;
    const totalRevenue = paidOrders.reduce(
      (acc, order) => acc + (order.totalAmount || 0),
      0
    );
    const pendingOrders = orders.filter(
      (order) => getPaymentStatus(order) === "pending"
    ).length;

    const settings = await getStoreSettings();
    const threshold = settings?.lowStockThreshold ?? 5;
    const lowStock = allProducts.filter(
      (p) => p.stock > 0 && p.stock <= threshold
    ).length;
    const outOfStock = allProducts.filter((p) => p.stock === 0).length;

    // Units sold + revenue per product (paid orders only).
    const productById = new Map(
      allProducts.map((p) => [String(p._id), p])
    );
    const units = new Map();
    const revenueByProduct = new Map();
    const revenueByCategory = new Map();

    for (const order of paidOrders) {
      for (const item of order.products || []) {
        const id = String(item.product);
        const qty = Math.max(1, Number(item.quantity) || 1);
        units.set(id, (units.get(id) || 0) + qty);
        const product = productById.get(id);
        if (product) {
          const lineRevenue = qty * (product.price || 0);
          revenueByProduct.set(
            id,
            (revenueByProduct.get(id) || 0) + lineRevenue
          );
          const category = product.category || "Uncategorized";
          revenueByCategory.set(
            category,
            (revenueByCategory.get(category) || 0) + lineRevenue
          );
        }
      }
    }

    const topProducts = [...units.entries()]
      .map(([id, unitsSold]) => {
        const product = productById.get(id);
        return {
          _id: id,
          title: product?.title || "Unknown product",
          image: product?.media?.[0] || "",
          units: unitsSold,
          revenue: Math.round((revenueByProduct.get(id) || 0) * 100) / 100,
          stock: product?.stock ?? 0,
        };
      })
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);

    const categoryRevenue = [...revenueByCategory.entries()]
      .map(([category, value]) => ({
        category,
        revenue: Math.round(value * 100) / 100,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);

    const recentOrders = await OrderModel.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("_id totalAmount paymentStatus orderStatus customerUserId createdAt")
      .lean();

    return jsonSuccess({
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders,
      totalCustomers: customers,
      pendingOrders,
      lowStock,
      outOfStock,
      topProducts,
      categoryRevenue,
      recentOrders,
    });
  } catch (err) {
    console.error("[analytics_GET]", err);
    return jsonError("Failed to load analytics.");
  }
};
