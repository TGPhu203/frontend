// src/api/attributeApi.ts
const BASE = "http://localhost:8888/api/attributes";
import { BASE_ORIGIN } from "@/api/Api";
function getAuthHeaders() {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem("user");
  if (!raw) return {};
  try {
    const user = JSON.parse(raw);
    if (!user?.token) return {};
    return { Authorization: `Bearer ${user.token}` };
  } catch {
    return {};
  }
}

export async function getAttributeGroups() {
  const res = await fetch(`${BASE}/groups`, {
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Không tải được nhóm thuộc tính");
  return json.data;
}

export async function createAttributeGroup(data: any) {
  const res = await fetch(`${BASE}/groups`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),          // 👈 THÊM
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Không tạo được nhóm thuộc tính");
  return json.data;
}

/* Dành cho AdminAttributeGroups dialog */
export type AttributeValue = {
  _id: string;
  attributeGroupId: string;
  name: string;
  value: string;
  colorCode?: string;
  imageUrl?: string;
  priceAdjustment?: number;
  sortOrder?: number;
  isActive?: boolean;
  affectsName?: boolean;
  nameTemplate?: string;
};

export async function getAttributeValues(groupId: string) {
  const res = await fetch(`${BASE}/groups/${groupId}/values`, {
    credentials: "include",
    headers: {
      ...getAuthHeaders(),          // 👈 THÊM (route này cũng là admin)
    },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Không tải được giá trị thuộc tính");
  }
  return json.data as AttributeValue[];
}

export async function createAttributeValue(
  groupId: string,
  data: Partial<AttributeValue>
) {
  const res = await fetch(`${BASE}/groups/${groupId}/values`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),          // 👈 THÊM
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Không tạo được giá trị thuộc tính");
  }
  return json.data as AttributeValue;
}

export async function updateAttributeValue(
  id: string,
  data: Partial<AttributeValue>
) {
  const res = await fetch(`${BASE}/values/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),          // 👈 THÊM
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Không cập nhật được giá trị thuộc tính");
  }
  return json.data as AttributeValue;
}

export async function deleteAttributeValue(id: string) {
  const res = await fetch(`${BASE}/values/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      ...getAuthHeaders(),          // 👈 THÊM
    },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Không xoá được giá trị thuộc tính");
  }
  return true;
}
export const getProductAttributeGroups = async (productId: string) => {
  const res = await fetch(
    `${BASE_ORIGIN}/api/attributes/products/${productId}/groups`
  );

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Không tải được thuộc tính sản phẩm");
  }
  return json.data || [];
};
// ✏️ Cập nhật nhóm thuộc tính (name, type, isRequired, sortOrder...)
export async function updateAttributeGroup(id: string, data: any) {
  const res = await fetch(`${BASE}/groups/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Không cập nhật được nhóm thuộc tính");
  }
  return json.data;
}

// (tuỳ chọn) Xoá / disable nhóm thuộc tính
export async function deleteAttributeGroup(id: string) {
  const res = await fetch(`${BASE}/groups/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      ...getAuthHeaders(),
    },
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Không xoá được nhóm thuộc tính");
  }
  return true;
}
