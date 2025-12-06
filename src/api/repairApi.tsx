// src/api/repairApi.ts
import { BASE_ORIGIN } from "./Api";

const BASE = `${BASE_ORIGIN}/api/repair-requests`;

export type CreateRepairRequestPayload = {
  customerName: string;
  phone: string;
  email?: string;
  productName: string;
  imei?: string;
  issueDescription: string;
  preferredTime?: string;
};

export async function createRepairRequest(payload: CreateRepairRequestPayload) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Không thể gửi yêu cầu sửa chữa");
  }
  return json.data;
}

// 🟣 Lấy lịch sử yêu cầu sửa chữa của user đã đăng nhập
export type RepairHistoryItem = {
  _id: string;
  customerName: string;
  phone: string;
  email?: string;
  productName: string;
  imei?: string;
  status: "new" | "in_progress" | "completed" | "cancelled" | string;
  issueDescription?: string;
  adminNotes?: string;
  createdAt: string;
};

export async function getMyRepairRequests(): Promise<RepairHistoryItem[]> {
  const res = await fetch(`${BASE}/my`, {
    method: "GET",
    credentials: "include",
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Không thể tải lịch sử bảo hành/sửa chữa");
  }

  // backend trả { status, data: [...] }
  return json.data || [];
}
