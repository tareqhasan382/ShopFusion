import { NextResponse } from "next/server";
import { stripe } from "../../../../lib/stripe";
import { BASEURL } from "@/app/(home)/page";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const { cartItems, customer } = await req.json();

    if (!cartItems || !customer) {
      return new NextResponse("Not enough data to checkout", { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      shipping_address_collection: {
        allowed_countries: ["BD", "IN"],
      },
      shipping_options: [
        { shipping_rate: "shr_1P9TWASGxMZw8AdNmNZdfOD2" },
        { shipping_rate: "shr_1P9TYISGxMZw8AdNeFnLx8bq" },
      ],
      line_items: cartItems?.map((cartItem) => ({
        price_data: {
          currency: "BDT",
          product_data: {
            name: cartItem?.item.title,
            metadata: {
              productId: cartItem?.item._id,
              ...(cartItem.size && { size: cartItem.size }),
              ...(cartItem.color && { color: cartItem.color }),
            },
          },
          unit_amount:
            parseFloat(cartItem?.item.price["$numberDecimal"] ?? 0).toFixed(2) *
            100,
        },
        quantity: cartItem.quantity,
      })),
      client_reference_id: customer.userId,
      success_url: `${BASEURL}/payment_success`,
      cancel_url: `${BASEURL}/cart`,
    });

    return NextResponse.json(session, { headers: corsHeaders });
  } catch (err) {
    console.log("[checkout_POST]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
