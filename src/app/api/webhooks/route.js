import { NextResponse } from "next/server";
import { stripe } from "../../../../lib/stripe";
import { connectMongodb } from "../../../../lib/mongodb";
import OrderModel from "../../../../lib/models/OrderModel";
import CustomerModel from "../../../../lib/models/CustomerModel";

export const POST = async (req) => {
  // console.log("==============webhooks Start=========");
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("Stripe-Signature");

    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      // console.log("session:", session);
      const customerInfo = {
        userId: session?.client_reference_id,
        name: session?.customer_details?.name,
        email: session?.customer_details?.email,
      };

      // console.log("customerInfo:", customerInfo);

      const shippingAddress = {
        country: session?.shipping_details?.address?.country,
        city: session?.shipping_details?.address?.city,
        street: session?.shipping_details?.address?.line2,
        state: session?.shipping_details?.address?.line2,
        postalCode: session?.shipping_details?.address?.postal_code,
      };
      // console.log("shippingAddress:", shippingAddress);
      const retrieveSession = await stripe.checkout.sessions.retrieve(
        session.id,
        { expand: ["line_items.data.price.product"] }
      );

      const lineItems = await retrieveSession?.line_items?.data;

      const orderItems = lineItems?.map((item) => {
        return {
          product: item.price.product.metadata.productId,
          color: item.price.product.metadata.color || "N/A",
          size: item.price.product.metadata.size || "N/A",
          quantity: item.quantity,
        };
      });

      await connectMongodb();

      const newOrder = new OrderModel({
        customerUserkId: customerInfo.userId,
        products: orderItems,
        shippingAddress,
        currency: session.currency,
        shippingRate: session?.shipping_cost?.shipping_rate,
        totalAmount: session.amount_total ? session.amount_total / 100 : 0,
      });

      await newOrder.save();

      let customer = await CustomerModel.findOne({
        userId: customerInfo.userId,
      });
      // console.log("customer find userModel:", customer);
      if (customer) {
        customer.orders.push(newOrder._id);
      } else {
        customer = new CustomerModel({
          ...customerInfo,
          orders: [newOrder._id],
        });
      }

      await customer.save();
    }

    return new NextResponse("Order created", { status: 200 });
  } catch (err) {
    console.log("[webhooks_POST]", err);
    return new NextResponse("Failed to create the order", { status: 500 });
  }
};
