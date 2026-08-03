import nodemailer from "nodemailer";
import { APP_NAME, BASEURL } from "./config";

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });
  return transporter;
};

/**
 * Send an email. When SMTP is not configured, logs the email instead (dev
 * friendly) so the rest of the flow never breaks.
 * Returns { sent, preview }.
 */
export const sendMail = async ({ to, subject, html, text = "" }) => {
  const t = getTransporter();
  if (!t) {
    console.warn(`[mailer] SMTP not configured — skipping email to "${to}" (${subject}).`);
    return { sent: false };
  }
  try {
    await t.sendMail({
      from: process.env.SMTP_FROM || `${APP_NAME} <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: text || "Please use an HTML-capable email client.",
      html,
    });
    return { sent: true };
  } catch (err) {
    console.error("[mailer] send failed:", err.message);
    return { sent: false };
  }
};

/** Simple HTML email wrapper with a shared layout. */
export const buildEmail = ({ title, content }) => `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#0f172a;line-height:1.6">
    <div style="background:#0f172a;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0">
      <strong>${APP_NAME}</strong>
    </div>
    <div style="border:1px solid #e2e8f0;border-top:none;padding:24px;border-radius:0 0 12px 12px">
      <h2 style="margin:0 0 12px;font-size:18px">${title}</h2>
      ${content}
    </div>
    <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:16px">
      ${APP_NAME} · <a href="${BASEURL}" style="color:#6366f1">${BASEURL}</a>
    </p>
  </div>
`;

/** Standard link button used in transactional emails. */
export const button = (label, url) => `
  <a href="${url}" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;margin:16px 0;font-weight:600">${label}</a>
`;

const formatPrice = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);

/** Best-effort order confirmation email. Never throws. */
export const sendOrderConfirmation = async ({ email, name, order }) => {
  if (!email) return { sent: false };
  const items = (order?.products || [])
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9">${item?.title || "Product"}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;text-align:center">${item?.quantity || 1}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;text-align:right">${formatPrice(item?.price || 0)}</td>
        </tr>`
    )
    .join("");

  return sendMail({
    to: email,
    subject: `Order confirmed${order?.invoiceNumber ? ` · ${order.invoiceNumber}` : ""} — ${APP_NAME}`,
    html: buildEmail({
      title: `Thanks${name ? `, ${name}` : ""}! Your order is confirmed.`,
      content: `
        <p>Your payment was successful and your order is being prepared.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
          <thead>
            <tr>
              <th style="text-align:left;padding:8px 0;color:#64748b">Item</th>
              <th style="text-align:center;padding:8px 0;color:#64748b">Qty</th>
              <th style="text-align:right;padding:8px 0;color:#64748b">Price</th>
            </tr>
          </thead>
          <tbody>${items}</tbody>
        </table>
        <p style="font-size:16px;font-weight:700">
          Total: ${formatPrice(order?.totalAmount)}
        </p>
        ${order?.invoiceNumber ? `<p style="color:#64748b">Invoice: <strong>${order.invoiceNumber}</strong></p>` : ""}
        <p>We'll email you again when your order ships.</p>
        ${button("View your order", `${BASEURL}/orders/${order?._id}`)}
      `,
    }),
  });
};

/** Best-effort order status update email. Never throws. */
export const sendOrderStatusEmail = async ({ email, name, order }) => {
  if (!email) return { sent: false };
  return sendMail({
    to: email,
    subject: `Order status update: ${order?.orderStatus || "updated"} — ${APP_NAME}`,
    html: buildEmail({
      title: `Your order ${order?._id ? String(order._id).slice(-6) : ""} is now "${order?.orderStatus || "updated"}".`,
      content: `
        <p>Hi${name ? ` ${name}` : ""},</p>
        <p>Your order status has been updated to <strong>${order?.orderStatus || "updated"}</strong>.</p>
        ${order?.trackingNumber ? `<p>Tracking number: <strong>${order.trackingNumber}</strong></p>` : ""}
        ${button("Track your order", `${BASEURL}/orders/${order?._id}`)}
      `,
    }),
  });
};
