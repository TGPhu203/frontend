// src/api/productSpecsApi.ts
import { BASE_ORIGIN } from "./Api";

export type ProductSpec = {
  _id?: string;
  attributeName: string;
  attributeValue: string;
  section?: string;      // "general" | "detail" | ...
  displayOrder?: number;
};

const BASE = `${BASE_ORIGIN}/api/product-attributes`;

// Lấy danh sách thông số theo productId
export async function getProductSpecs(productId: string): Promise<ProductSpec[]> {
  const res = await fetch(`${BASE}/${productId}/specs`, {
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Không tải được thông số kỹ thuật");

  // json.data có thể là { general: [], detail: [] } hoặc 1 mảng
  // nếu backend trả grouped dạng { general: [...], detail: [...] } thì flatten:
  if (Array.isArray(json.data)) return json.data;

  const grouped = json.data || {};
  const result: ProductSpec[] = [];
  Object.entries(grouped).forEach(([section, items]: any) => {
    (items || []).forEach((it: any) =>
      result.push({ ...it, section })
    );
  });
  return result;
}

// Tạo thông số mới
export async function createProductSpec(
  productId: string,
  payload: ProductSpec
): Promise<ProductSpec> {
  const res = await fetch(`${BASE}/${productId}/specs`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Không tạo được thông số");
  return json.data;
}

// Cập nhật thông số
export async function updateProductSpec(
  specId: string,
  payload: Partial<ProductSpec>
): Promise<ProductSpec> {
  const res = await fetch(`${BASE}/specs/${specId}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Không cập nhật được thông số");
  return json.data;
}

// Xoá thông số
export async function deleteProductSpec(specId: string): Promise<void> {
  const res = await fetch(`${BASE}/specs/${specId}`, {
    method: "DELETE",
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Không xoá được thông số");
}
