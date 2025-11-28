// src/api/paymentApi.ts
import { BASE_ORIGIN } from "./Api";

const BASE = `${BASE_ORIGIN}/api/payments`;

export async function createPaymentIntent(orderId: string) {
  const res = await fetch(`${BASE}/create-payment-intent`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orderId }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Không tạo được payment intent");
  }
  return json.data;
}

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

// ✅ Thêm hàm tạo link thanh toán PayOS
export const createPayOSPaymentLink = async (orderId: string) => {
  const res = await fetch(`${BASE}/payos/create-link`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Không tạo được link thanh toán PayOS");
  }

  // backend đang trả { status, data: { checkoutUrl, paymentLinkId, orderCode } }
  return json.data as {
    checkoutUrl: string;
    paymentLinkId: string;
    orderCode: number;
  };
};
