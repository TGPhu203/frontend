// src/api/attributeApi.ts
const BASE = "http://localhost:8888/api/attributes";

export async function getAttributeGroups() {
  const res = await fetch(`${BASE}/groups`, { credentials: "include" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Không tải được nhóm thuộc tính");
  // backend đang trả { success, data } nên:
  return json.data;
}

export async function createAttributeGroup(data: any) {
  const res = await fetch(`${BASE}/groups`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Không tạo được nhóm thuộc tính");
  return json.data;
}
