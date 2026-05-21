import "server-only";

import Stripe from "stripe";

let stripeSingleton: Stripe | null = null;

export function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(key);
  }
  return stripeSingleton;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function getAppBaseUrl(): string {
  const url = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
  if (!url) {
    throw new Error("AUTH_URL (or NEXTAUTH_URL) is required for Stripe Checkout return URLs.");
  }
  return url.replace(/\/$/, "");
}
