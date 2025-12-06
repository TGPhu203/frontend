// src/api/warrantyApi.ts
import { BASE_ORIGIN } from "./Api";

const BASE = `${BASE_ORIGIN}/api/warranty-packages`;

// ================== Lấy tất cả gói bảo hành ==================
export const getAllWarrantyPackages = async (params?: {
  page?: number;
  limit?: number;
  isActive?: boolean;
}) => {
  const search = new URLSearchParams();

  if (params?.page) search.set("page", String(params.page));
  if (params?.limit) search.set("limit", String(params.limit));
  if (params?.isActive !== undefined) {
    // BE đang check isActive === 'true'
    search.set("isActive", String(params.isActive)); // "true"/"false"
  }

  const qs = search.toString();
  const url = qs ? `${BASE}?${qs}` : BASE; // tránh trường hợp "/api/warranty-packages?"

  const res = await fetch(url, {
    method: "GET",
    // route public nên không bắt buộc credentials, nhưng để cũng không sao
    credentials: "include",
  });

  const json = await res.json();

  if (!res.ok) {
    // BE trả {status:'error', message:'...'}
    throw new Error(json.message || "Không thể tải gói bảo hành");
  }

  // BE trả: { status, data: { warrantyPackages, pagination } }
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

// ================== Lấy gói bảo hành theo productId ==================
export const getWarrantyPackagesByProduct = async (productId: string) => {
  const res = await fetch(`${BASE}/product/${productId}`, {
    method: "GET",
    credentials: "include",
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(
      json.message || "Không thể tải gói bảo hành của sản phẩm"
    );
  }

  // BE: { status, data: { warrantyPackages, productId } }
  return json.data as {
    warrantyPackages: any[];
    productId: string;
  };
};

// ================== Lấy chi tiết 1 gói bảo hành ==================
export const getWarrantyPackageById = async (id: string) => {
  const res = await fetch(`${BASE}/${id}`, {
    method: "GET",
    credentials: "include",
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Không thể tải chi tiết gói bảo hành");
  }

  // BE: { status, data: {...} }
  return json.data;
};

// ================== Tra cứu bảo hành theo IMEI ==================
export async function lookupWarrantyByImei(imei: string) {
  const encoded = encodeURIComponent(imei.trim());

  const res = await fetch(`${BASE}/imei/${encoded}`, {
    method: "GET",
    credentials: "include",
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Không thể tra cứu bảo hành theo IMEI");
  }

  // BE: { status, data: {...} }
  return json.data || json;
}
