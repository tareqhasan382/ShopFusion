# ShopFusion

> Modern e-commerce platform — storefront + admin dashboard.

**ShopFusion** is a full-featured e-commerce web app: a responsive storefront (catalog, cart, wishlist, Stripe Checkout, order tracking) paired with a complete admin dashboard (products, collections, orders, customers, analytics). Built with **Next.js 14**, **MongoDB**, **Stripe**, and **Tailwind CSS**, with custom JWT authentication and secure, rate-limited APIs.

## Features

### Storefront
- Product catalog with collections, search-friendly listing, and product detail pages with gallery, color/size selection, and quantity.
- Shopping cart and wishlist (Zustand + API-backed wishlist for signed-in users).
- Checkout powered by Stripe Checkout Sessions with env-configurable shipping rates and countries. The browser redirects to the hosted Checkout Session URL.
- Every checkout attempt is tracked: a pending order is recorded with the Stripe session id up front, then flips to **paid** on success (storing the payment intent id) or **cancelled** if the user backs out or the session expires. This covers abandoned checkouts too.
- Order history with live tracking — customers see both **payment status** (pending / paid / cancelled / refunded) and **fulfillment status** (placed → processing → shipped → delivered, plus cancelled / returned) with a visual timeline.
- Fully responsive layout with a sticky navbar, footer, and loading/error states.

### Accounts & Security
- Custom email/password sign-in and sign-up with client + server validation.
- HttpOnly JWT session cookie (`shopfusion_session`) verified by middleware and every protected route.
- Rate limiting on auth endpoints (login, registration, wishlist, checkout, admin writes).
- Admin-only protection on all management API routes and the `/admin` area.
- Passwords hashed with bcrypt (only re-hashed when changed); `password` excluded from API responses.
- Generic login error messages; credentials not leaked.

### Admin Dashboard
- Stats overview (revenue, orders, customers) and monthly sales chart (Recharts).
- CRUD for products (multi-image upload to Cloudinary, colors, sizes, tags, collections) and collections.
- Order management with customer and shipping details.
- Order tracking: update payment and fulfillment status from the order detail page (payment: `pending`/`paid`/`cancelled`/`refunded`; fulfillment: `placed`→`processing`→`shipped`→`delivered`, with `cancelled`/`returned`). Dashboard stats only count paid orders as revenue.
- Paginated tables and responsive navigation (sidebar on desktop, dropdown menu on mobile).

## Tech Stack

- **Next.js 14** (App Router, Server Components, Route Handlers, Middleware)
- **MongoDB + Mongoose**
- **Stripe** (server SDK)
- **jose** (JWT sessions), **bcryptjs**
- **Cloudinary** (image uploads)
- **Tailwind CSS**, **lucide-react**, **Recharts**, **Zustand**, **react-toastify**

## Getting Started

### Prerequisites

- Node.js 18.17+ and npm
- MongoDB database (local or Atlas)
- Stripe account (for checkout) and Cloudinary account (for image uploads)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Then fill in your values:

| Variable | Description |
| --- | --- |
| `MONGODB_URL` | MongoDB connection string |
| `AUTH_SECRET` | Secret for signing session JWTs. Generate with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `CLOUD_NAME` / `CLOUD_API_KEY` / `CLOUD_API_SECRET` | Cloudinary credentials |
| `NEXT_PUBLIC_BASE_URL` | Public base URL (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_CURRENCY` | Store currency code (default `usd`) |

### 3. Run locally

```bash
npm run dev
```

Open http://localhost:3000.

### Admin access

The first account registered becomes an admin when `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set in `.env`. Alternatively, set a user's `role` to `admin` directly in the database. The admin dashboard lives at `/admin`.

### Stripe payments (local development)

**How orders are tracked.** A "pending" order is created the moment a checkout
session starts — it records the Stripe session id (`stripeSessionId`) and shows
in the admin dashboard as `pending`. From there the same order is updated by
Stripe ID as the payment lifecycle unfolds:

- **Paid** — `/payment_success` (server-side, verified against Stripe,
  idempotent) or the webhook flips it to `paid` and stores the payment intent id.
- **Cancelled** — `cancel_url` points to `/payment_cancelled?session_id=...`,
  which marks the pending order `cancelled` and records the payment intent id if
  available. The webhook covers `checkout.session.expired` and
  `payment_intent.cancelled` the same way.

So every checkout attempt — success or abandonment — leaves a trackable order
record keyed by the Stripe session id. Only `paid` orders count toward revenue.

The checkout button redirects the browser to the hosted Checkout Session URL
(no client-side Stripe.js required). The secret key (`STRIPE_SECRET_KEY`) stays
server-side; the publishable key
(`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`) is kept in the config for future
client-side Stripe integrations (e.g. Payment Element).

The webhook at `/api/webhooks` is a **backup** path for async confirmations and
creates/updates the same order idempotently (no duplicates). Register these
events on it and exercise locally:

```bash
stripe listen --forward-to localhost:3000/api/webhooks
# events: checkout.session.completed, checkout.session.expired, payment_intent.cancelled
```

Copy the signing secret printed by `stripe listen` into `STRIPE_WEBHOOK_SECRET`
(it changes on every run). Ports shown assume `NEXT_PUBLIC_BASE_URL` matches
your dev server's actual port.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

## Security notes

- `.env` is gitignored and must never be committed. Use `.env.example` as a template.
- The built-in rate limiter is in-memory; scale it to a shared store (e.g. Redis) if running multiple instances.
- Rotate any credentials that were previously committed to git.

## Project structure

```
actions/           Server actions (image uploads)
lib/               Auth, validation, rate limiting, models, config, Stripe
src/app/api/       Route handlers (auth, products, collections, orders, checkout, webhooks)
src/app/(home)/    Storefront pages
src/app/(auth)/    Sign-in / sign-up
src/app/(dashboard)/ Admin pages
src/components/    Shared UI, storefront and dashboard components
src/store/         Zustand cart store
```
