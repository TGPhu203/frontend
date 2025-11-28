const ADMIN_BASE_URL = "http://localhost:8888/api/admin";

const getToken = () => {
  const raw = localStorage.getItem("user");
  const u = raw ? JSON.parse(raw) : null;
  return u?.token || "";
};

/* ===================== GET PRODUCTS ===================== */
export async function getAdminProducts(page = 1, limit = 20) {
  const res = await fetch(
    `${ADMIN_BASE_URL}/products?page=${page}&limit=${limit}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  if (!res.ok) throw new Error("Không thể tải sản phẩm");

  const json = await res.json();

  // backend có thể trả:
  // - mảng: [ {..product..} ]
  // - object: { status, data: { products: [...] } }
  if (Array.isArray(json)) return json;

  if (json?.data?.products && Array.isArray(json.data.products)) {
    return json.data.products;
  }

  // fallback: nếu backend trả data là mảng
  if (Array.isArray(json?.data)) return json.data;

  return [];
}
/* ===================== CREATE PRODUCT ===================== */
export async function createAdminProduct(data: any) {
  const res = await fetch(`${ADMIN_BASE_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Không thể tạo sản phẩm");
  return res.json();
}
export async function updateAdminProduct(id: string, data: any) {
  const res = await fetch(`${ADMIN_BASE_URL}/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    // nếu backend trả 204 / không có body
  }

  if (!res.ok) {
    const message = json?.message || "Không thể cập nhật sản phẩm";
    throw new Error(message);
  }

  return json;
}

/* ===================== DELETE PRODUCT ===================== */
export async function deleteAdminProduct(id: string) {
  const res = await fetch(`${ADMIN_BASE_URL}/products/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) throw new Error("Không thể xoá sản phẩm");
  return res.json();
}
