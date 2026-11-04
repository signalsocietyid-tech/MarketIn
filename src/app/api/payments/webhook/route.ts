import { NextResponse } from "next/server";

/**
 * Payment gateway notification endpoint (Midtrans HTTP notification / Xendit callback).
 *
 * Not active yet: it rejects every request so that no subscription can be
 * activated without a verified gateway signature. When implementing:
 *  1. Verify the signature (Midtrans: SHA512(order_id+status_code+gross_amount+server_key);
 *     Xendit: compare the x-callback-token header with XENDIT_CALLBACK_TOKEN).
 *  2. Look up the pending subscription by paymentReference / order id.
 *  3. On settlement/paid, set status "active" and the billing period; record a subscription event.
 */
export async function POST() {
  return NextResponse.json({ error: "Payment gateway not configured" }, { status: 501 });
}
