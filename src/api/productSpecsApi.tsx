// src/api/productSpecsApi.ts
import { BASE_ORIGIN } from "./Api";

export type ProductSpec = {
    _id?: string;
    attributeName: string;
    attributeValue: string;
    section?: string;
    displayOrder?: number;
  };
  

const BASE = `${BASE_ORIGIN}/api/product-attributes`;

// Lấy token từ localStorage
function getAuthHeaders() {
  const rawUser = localStorage.getItem("user");
  let token = "";

  if (rawUser) {
    try {
      const parsed = JSON.parse(rawUser);
      // Đổi key này cho đúng với cấu trúc user của bạn
      token = parsed?.token || parsed?.accessToken || "";
    } catch {
      token = "";
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

// Lấy danh sách thông số theo productId
export async function getProductSpecs(productId: string): Promise<ProductSpec[]> {
  const res = await fetch(`${BASE}/${productId}/specs`, {
    credentials: "include",
    // không bắt buộc gửi token, nhưng gửi cũng không sao
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Không tải được thông số kỹ thuật");

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
    headers: getAuthHeaders(),          // ✅ thêm
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
    headers: getAuthHeaders(),          // ✅ thêm
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
    headers: getAuthHeaders(),          // ✅ thêm
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Không xoá được thông số");
}
