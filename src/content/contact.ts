// NOTE: These are PLACEHOLDER addresses. Confirm that each mailbox exists and is
// monitored before launch, then update them here — every marketing and legal page
// reads from this file.
export const CONTACT_EMAILS = {
  general: "hello@marketin.id",
  partnership: "partnership@marketin.id",
  support: "support@marketin.id",
} as const;

export type ContactChannel = keyof typeof CONTACT_EMAILS;

/** Builds a mailto: link with an optional pre-filled subject. */
export function mailto(channel: ContactChannel, subject?: string) {
  const address = CONTACT_EMAILS[channel];
  return subject ? `mailto:${address}?subject=${encodeURIComponent(subject)}` : `mailto:${address}`;
}
