// src/api/warrantyApi.ts
import { BASE_ORIGIN } from "./Api";

const BASE = `${BASE_ORIGIN}/api/warranty-packages`;

// Lấy tất cả gói bảo hành (trang “Bảo hành & Dịch vụ”)
export const getAllWarrantyPackages = async (params?: {
  page?: number;
  limit?: number;
  isActive?: boolean;
}) => {
  const search = new URLSearchParams();
  if (params?.page) search.set("page", String(params.page));
  if (params?.limit) search.set("limit", String(params.limit));
  if (params?.isActive !== undefined)
    search.set("isActive", String(params.isActive));

  const res = await fetch(`${BASE}?${search.toString()}`, {
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Không thể tải gói bảo hành");

  // backend trả: { status, data: { warrantyPackages, pagination } }
  return json.data as {
    warrantyPackages: any[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
};

// Lấy gói bảo hành theo productId (dùng trên trang chi tiết sản phẩm)
export const getWarrantyPackagesByProduct = async (productId: string) => {
  const res = await fetch(`${BASE}/product/${productId}`, {
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok)
    throw new Error(json.message || "Không thể tải gói bảo hành của sản phẩm");

  // backend trả: { status, data: { warrantyPackages, productId } }
  return json.data as {
    warrantyPackages: any[];
    productId: string;
  };
};

// Lấy chi tiết 1 gói bảo hành theo id (nếu cần)
export const getWarrantyPackageById = async (id: string) => {
  const res = await fetch(`${BASE}/${id}`, {
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok)
    throw new Error(json.message || "Không thể tải chi tiết gói bảo hành");
  return json.data;
};
export async function lookupWarrantyByImei(imei: string) {
  const encoded = encodeURIComponent(imei.trim());

  // DÙNG BASE, KHÔNG GỌI /api/warranty nữa
  const res = await fetch(`${BASE}/imei/${encoded}`, {
    credentials: "include",
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Không thể tra cứu bảo hành theo IMEI");
  }

  return json.data || json;
}