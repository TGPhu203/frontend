// src/api/orderApi.ts
import { BASE_ORIGIN } from "./Api";
const BASE = `${BASE_ORIGIN}/api/orders`;
// 👇 dùng group admin ở order.routes.js
// GET:  /api/orders/admin/all
// PATCH: /api/orders/admin/:id/status
const ADMIN_ORDERS_BASE = `${BASE_ORIGIN}/api/orders/admin`;
const PAY_BASE = `${BASE_ORIGIN}/api/payments`;

/* ========== USER ========= */

export const createOrder = async (data: any) => {
  const res = await fetch(BASE, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Không thể tạo đơn hàng");
  return json.data;
};

export const getUserOrders = async (page = 1, limit = 20) => {
  const res = await fetch(`${BASE}?page=${page}&limit=${limit}`, {
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Không thể tải danh sách đơn");
  return json.data;
};

export const getOrderById = async (id: string) => {
  const res = await fetch(`${BASE}/${id}`, { credentials: "include" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Không thể tải đơn hàng");
  return json.data;
};

export const cancelOrder = async (id: string) => {
  const res = await fetch(`${BASE}/${id}/cancel`, {
    method: "POST",
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Không thể hủy đơn hàng");
  return json.data;
};

export const repayOrder = async (id: string) => {
  const res = await fetch(`${BASE}/${id}/repay`, {
    method: "POST",
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Không thể thanh toán lại đơn");
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

  const res = await fetch(
    `${ADMIN_ORDERS_BASE}/all?${params.toString()}`,
    {
      credentials: "include",
    }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Không thể tải đơn hàng");

  // backend chuẩn: { status, data: { orders, total, pages, currentPage } }
  const data = json.data;

  if (data?.orders && Array.isArray(data.orders)) return data.orders;

  // các fallback khác nếu sau này có thay đổi response
  if (Array.isArray(json)) return json;
  if (Array.isArray(data)) return data;
  if (data?.items && Array.isArray(data.items)) return data.items;

  return [];
};
export const adminUpdateOrderStatus = async (id: string, status: string) => {
  const res = await fetch(`${ADMIN_ORDERS_BASE}/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Không thể cập nhật trạng thái đơn hàng");
  }
  return json.data ?? json;
};

/* ========== PAYMENT ========= */

export const createVnPayPayment = async (orderId: string) => {
  const res = await fetch(`${PAY_BASE}/vnpay`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId }),
  });
  const json = await res.json();
  if (!res.ok)
    throw new Error(json.message || "Không thể tạo thanh toán VNPAY");
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
  if (!res.ok)
    throw new Error(json.message || "Không thể tạo thanh toán MOMO");
  return json.data;
};
