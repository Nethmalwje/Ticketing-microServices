import Stripe from "stripe";

//instant from stripe class
export const stripe = new Stripe(process.env.STRIPE_KEY!, {
  apiVersion: "2024-04-10",
});
