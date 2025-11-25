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
