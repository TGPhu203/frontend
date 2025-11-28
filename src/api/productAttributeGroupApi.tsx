// src/api/productAttributeGroupApi.ts
const BASE = "http://localhost:8888/api/attributes";

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

export type AttributeValue = {
  _id: string;
  name: string;
  value: string;
  colorCode?: string;
  imageUrl?: string;
  priceAdjustment?: number;
  sortOrder?: number;
  isActive?: boolean;
};

export type ProductAttributeGroupItem = {
  _id: string;
  productId: string;
  attributeGroupId: {
    _id: string;
    name: string;
    type: "select" | "color" | "text" | "number";
    isRequired?: boolean;
    values?: AttributeValue[];
  };
  isRequired: boolean;
  sortOrder: number;
};

// GET các nhóm thuộc tính đã gán cho 1 product (public)
export async function getProductAttributeGroups(productId: string) {
  const res = await fetch(`${BASE}/products/${productId}/groups`, {
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(
      json.message || "Không tải được nhóm thuộc tính của sản phẩm"
    );
  }
  return json.data as ProductAttributeGroupItem[];
}

// POST gán / cập nhật (upsert) nhóm thuộc tính cho product
export async function upsertProductAttributeGroup(
  productId: string,
  attributeGroupId: string,
  payload: { isRequired?: boolean; sortOrder?: number }
) {
  const res = await fetch(
    `${BASE}/products/${productId}/groups/${attributeGroupId}`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    }
  );
  const json = await res.json();
  if (!res.ok) {
    throw new Error(
      json.message || "Không gán được nhóm thuộc tính cho sản phẩm"
    );
  }
  return json.data as ProductAttributeGroupItem;
}

// DELETE bỏ gán nhóm thuộc tính khỏi product
export async function removeProductAttributeGroup(
  productId: string,
  attributeGroupId: string
) {
  const res = await fetch(
    `${BASE}/products/${productId}/groups/${attributeGroupId}`,
    {
      method: "DELETE",
      credentials: "include",
      headers: {
        ...getAuthHeaders(),
      },
    }
  );
  const json = await res.json();
  if (!res.ok) {
    throw new Error(
      json.message || "Không xoá được nhóm thuộc tính khỏi sản phẩm"
    );
  }
  return true;
}
