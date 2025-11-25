// src/api/orderApi.ts
import { BASE_ORIGIN } from "./Api";

const BASE = `${BASE_ORIGIN}/api/orders`;
const ADMIN_BASE = `${BASE_ORIGIN}/api/admin/orders`;
const PAY_BASE = `${BASE_ORIGIN}/api/payments`;

export const createOrder = async (data: any) => {
  const res = await fetch(BASE, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json.data;
};

export const getUserOrders = async (page = 1, limit = 20) => {
  const res = await fetch(`${BASE}?page=${page}&limit=${limit}`, {
    credentials: "include",
  });
  const json = await res.json();
  return json.data;
};

export const getOrderById = async (id: string) => {
  const res = await fetch(`${BASE}/${id}`, { credentials: "include" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json.data;
};

export const cancelOrder = async (id: string) => {
  const res = await fetch(`${BASE}/${id}/cancel`, {
    method: "POST",
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json.data;
};

export const repayOrder = async (id: string) => {
  const res = await fetch(`${BASE}/${id}/repay`, {
    method: "POST",
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json.data;
};

/* ========== ADMIN ========= */
export const adminGetAllOrders = async (q: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) => {
  const params = new URLSearchParams();
  if (q.page) params.append("page", String(q.page));
  if (q.limit) params.append("limit", String(q.limit));
  if (q.status) params.append("status", q.status);
  if (q.search) params.append("search", q.search);

  const res = await fetch(`${ADMIN_BASE}?${params.toString()}`, {
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Không thể tải đơn hàng");

  // 👇 Xử lý cả 2 dạng: mảng thuần hoặc object có data
  if (Array.isArray(json)) return json;       // backend trả trực tiếp mảng

  const data = json.data;
  if (Array.isArray(data)) return data;
  if (data?.orders && Array.isArray(data.orders)) return data.orders;
  if (data?.items && Array.isArray(data.items)) return data.items;

  return [];
};


export const adminUpdateOrderStatus = async (id: string, data: any) => {
  const res = await fetch(`${ADMIN_BASE}/${id}/status`, {
    method: "PATCH", // hoặc "PUT" nếu backend dùng PUT
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json.data;
};


/* ========== PAYMENT (FE gọi backend) ========= */
export const createVnPayPayment = async (orderId: string) => {
  const res = await fetch(`${PAY_BASE}/vnpay`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  // backend should return { url: "https://vnpay/..." } or data
  return json.data;
};

export const createMomoPayment = async (orderId: string) => {
  const res = await fetch(`${PAY_BASE}/momo`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json.data;
};
