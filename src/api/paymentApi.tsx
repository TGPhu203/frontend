import { BASE_ORIGIN } from "./Api";

const BASE = `${BASE_ORIGIN}/api/payments`;

export const createPaymentIntent = async (amount: number, orderId: string) => {
  const res = await fetch(`${BASE}/create-payment-intent`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount, // KHÔNG nhân 100
      currency: "vnd",
      orderId,
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json.data;
};

export const confirmPayment = async (paymentIntentId: string) => {
  const res = await fetch(`${BASE}/confirm-payment`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentIntentId }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json.data;
};
