// src/api/couponApi.ts
import { BASE_ORIGIN } from "./Api";

const ADMIN_BASE = `${BASE_ORIGIN}/api/admin/coupons`;

export type Coupon = {
  _id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  usedCount?: number;
  isActive: boolean;
  applicableTiers?: string[];
  description?: string;
};

export const adminGetCoupons = async (): Promise<Coupon[]> => {
  const res = await fetch(ADMIN_BASE, { credentials: "include" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Không tải được mã ưu đãi");
  return Array.isArray(json.data) ? json.data : [];
};

export const adminCreateCoupon = async (data: Partial<Coupon>) => {
  const res = await fetch(ADMIN_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Không tạo được mã ưu đãi");
  return json.data;
};

export const adminUpdateCoupon = async (id: string, data: Partial<Coupon>) => {
  const res = await fetch(`${ADMIN_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Không cập nhật được mã ưu đãi");
  return json.data;
};

export const adminDeleteCoupon = async (id: string) => {
  const res = await fetch(`${ADMIN_BASE}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Không xóa được mã ưu đãi");
  return json;
};
export async function applyCoupon(code: string, orderAmount: number) {
    const res = await fetch(`${BASE_ORIGIN}/api/coupons/apply`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code, orderAmount }),
    });
  
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || "Không áp dụng được mã ưu đãi");
    }
  
    // backend trả về { data: { coupon, discountAmount, finalAmount } }
    return json.data as {
      coupon: any;
      discountAmount: number;
      finalAmount: number;
    };
  }
  export async function getAvailableCoupons(orderAmount: number) {
    const res = await fetch(
      `${BASE_ORIGIN}/api/coupons/available?orderAmount=${orderAmount}`,
      {
        credentials: "include",
      }
    );
  
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || "Không lấy được danh sách mã ưu đãi");
    }
  
    return json.data as any[];   // mỗi item có thêm isEligible
  }
  