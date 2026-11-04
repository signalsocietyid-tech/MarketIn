import "server-only";
import type { BillingCycle, SubscriptionPlan, User } from "@/lib/types";

/**
 * Payment gateway abstraction. MarketIn does not process payments yet:
 * the default "mock" provider only records a pending checkout and NEVER marks a
 * subscription as paid. Midtrans and Xendit adapters are stubs that document
 * what to implement once merchant credentials are available.
 */

export type CheckoutRequest = {
  user: Pick<User, "id" | "email" | "name">;
  plan: SubscriptionPlan;
  cycle: BillingCycle;
  amount: number;
  orderId: string;
};

export type CheckoutResult = {
  provider: string;
  reference: string;
  /** Hosted payment page to redirect to. Undefined when no gateway is connected. */
  redirectUrl?: string;
  status: "pending";
};

export interface PaymentProvider {
  readonly name: string;
  readonly connected: boolean;
  createCheckout(req: CheckoutRequest): Promise<CheckoutResult>;
}

const mockProvider: PaymentProvider = {
  name: "mock",
  connected: false,
  async createCheckout(req) {
    return { provider: "mock", reference: `mock_${req.orderId}`, status: "pending" };
  },
};

/** Midtrans Snap — https://docs.midtrans.com/reference/snap-api */
const midtransProvider: PaymentProvider = {
  name: "midtrans",
  connected: !!process.env.MIDTRANS_SERVER_KEY,
  async createCheckout() {
    // TODO: POST https://app.sandbox.midtrans.com/snap/v1/transactions with
    // Basic auth (MIDTRANS_SERVER_KEY) and { transaction_details: { order_id, gross_amount } }.
    // Return { redirectUrl: response.redirect_url }. Confirm payment ONLY via the
    // signed HTTP notification handled in src/app/api/payments/webhook/route.ts.
    throw new Error("Midtrans integration is not implemented yet. See docs/PAYMENTS.md.");
  },
};

/** Xendit Invoices — https://developers.xendit.co/api-reference/#create-invoice */
const xenditProvider: PaymentProvider = {
  name: "xendit",
  connected: !!process.env.XENDIT_SECRET_KEY,
  async createCheckout() {
    // TODO: POST https://api.xendit.co/v2/invoices with Basic auth (XENDIT_SECRET_KEY)
    // and { external_id: orderId, amount, payer_email }. Return { redirectUrl: invoice_url }.
    // Verify callbacks with the x-callback-token header (XENDIT_CALLBACK_TOKEN).
    throw new Error("Xendit integration is not implemented yet. See docs/PAYMENTS.md.");
  },
};

export function getPaymentProvider(): PaymentProvider {
  switch (process.env.PAYMENT_PROVIDER) {
    case "midtrans":
      return midtransProvider;
    case "xendit":
      return xenditProvider;
    default:
      return mockProvider;
  }
}
