# Payments: integration plan

MarketIn does **not** process payments yet. This document describes the current behaviour and what to build.

## Current behaviour

1. A user picks a Pro plan → `/checkout?plan=…&cycle=monthly|yearly`.
2. **Request upgrade** calls `startCheckout` (`src/lib/actions/account.ts`), which calls `getPaymentProvider().createCheckout(...)`.
3. With `PAYMENT_PROVIDER=mock` (default) the provider returns a `pending` reference and no redirect. A `user_subscriptions` row is stored with `status = pending_payment`, plus an `upgrade_requested` event. The user's current plan is unchanged.
4. An admin confirms payment outside the platform, then clicks **Activate manually** in `/admin/subscriptions`. That sets `active` with a new billing period and logs an `activated` event.

At no point does the app mark a payment as successful by itself.

## Interface

`src/lib/payments/index.ts`

```ts
interface PaymentProvider {
  name: string;
  connected: boolean;
  createCheckout(req: { user, plan, cycle, amount, orderId }): Promise<{ provider, reference, redirectUrl?, status: "pending" }>;
}
```

If `redirectUrl` is returned, `startCheckout` redirects the user to the hosted payment page.

## Midtrans (Snap)

- Env: `PAYMENT_PROVIDER=midtrans`, `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `MIDTRANS_IS_PRODUCTION`.
- `createCheckout`: `POST https://app.sandbox.midtrans.com/snap/v1/transactions` (production: `app.midtrans.com`) with Basic auth `base64(SERVER_KEY + ":")` and body `{ transaction_details: { order_id, gross_amount }, customer_details: { email, first_name } }`. Return `redirect_url`.
- Webhook (`src/app/api/payments/webhook/route.ts`): verify `signature_key === sha512(order_id + status_code + gross_amount + SERVER_KEY)`. On `settlement`, or `capture` with `fraud_status = accept`, activate the subscription found by `payment_reference`. On `expire`, `cancel` or `deny`, mark it canceled.

## Xendit (Invoices)

- Env: `PAYMENT_PROVIDER=xendit`, `XENDIT_SECRET_KEY`, `XENDIT_CALLBACK_TOKEN`.
- `createCheckout`: `POST https://api.xendit.co/v2/invoices` with Basic auth `base64(SECRET_KEY + ":")` and `{ external_id: orderId, amount, payer_email, description, currency: "IDR" }`. Return `invoice_url`.
- Webhook: compare the `x-callback-token` header with `XENDIT_CALLBACK_TOKEN`. On `PAID` activate; on `EXPIRED` cancel.

## Activation logic (shared)

Reuse the logic in `adminActivateSubscription` (`src/lib/actions/admin.ts`): close other active subscriptions for the user, set the period start/end from the billing cycle, record an event and notify the user. With Supabase, run it with the service-role client and make it idempotent on `payment_reference`.

## Recurring billing

Neither Snap nor Invoices auto-renews by default. Options: send a renewal invoice before `current_period_end` (scheduled job), or use Xendit Recurring / Midtrans subscription APIs. Until then, expire subscriptions after `current_period_end`; `getActiveSubscription` already treats past periods as inactive.
