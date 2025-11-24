// ==============================================
// 🔥 src/lib/api.ts (FULL FILE - TypeScript)
// ==============================================
export const BASE_ORIGIN = "http://localhost:8888";     // dùng cho ảnh
export const BASE_API = "http://localhost:8888/api";
export interface FetchProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "ASC" | "DESC";
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  inStock?: boolean;
  featured?: boolean;
  status?: string;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
}

// Convert object → query string (loại undefined/null)
function toQueryString(params: Record<string, any>) {
  const filtered: Record<string, string> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      filtered[key] = String(value);
    }
  });

  return new URLSearchParams(filtered).toString();
}

// 🌐 BASE URL BACKEND
const BASE_URL = "http://localhost:8888/api";

// ==============================================
// 📌 Lấy danh sách sản phẩm + filters
// ==============================================
export async function fetchProducts(
  params: FetchProductsParams = {}
): Promise<ApiResponse<any>> {
  const query = toQueryString(params);

  const res = await fetch(`${BASE_URL}/products?${query}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    const errMsg = await res.text();
    throw new Error(`Failed to fetch products: ${errMsg}`);
  }

  return res.json();
}

// ==============================================
// 📌 Lấy sản phẩm theo ID
// ==============================================
export async function fetchProductById(
  id: string
): Promise<ApiResponse<any>> {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch product with ID: ${id}`);
  }

  return res.json();
}

// ==============================================
// 📌 Lấy sản phẩm theo slug
// ==============================================
export async function fetchProductBySlug(
  slug: string,
  skuId?: string
): Promise<ApiResponse<any>> {
  const query = skuId ? `?skuId=${skuId}` : "";

  const res = await fetch(`${BASE_URL}/products/slug/${slug}${query}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch product slug: ${slug}`);
  }

  return res.json();
}

// ==============================================
// 📌 Lấy featured products
// ==============================================
export async function fetchFeaturedProducts(): Promise<ApiResponse<any>> {
  const res = await fetch(`${BASE_URL}/products/featured`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch featured products");
  return res.json();
}

// ==============================================
// 📌 Lấy sản phẩm mới
// ==============================================
export async function fetchNewArrivals(): Promise<ApiResponse<any>> {
  const res = await fetch(`${BASE_URL}/products/new-arrivals`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch new arrivals");
  return res.json();
}

// ==============================================
// 📌 Lấy biến thể sản phẩm
// ==============================================
export async function fetchProductVariants(
  productId: string
): Promise<ApiResponse<any>> {
  const res = await fetch(`${BASE_URL}/products/${productId}/variants`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch variants for product ${productId}`);
  }

  return res.json();
}

// ==============================================
// 📌 Lấy tóm tắt đánh giá
// ==============================================
export async function fetchProductReviewsSummary(
  productId: string
): Promise<ApiResponse<any>> {
  const res = await fetch(
    `${BASE_URL}/products/${productId}/reviews-summary`,
    { cache: "no-store" }
  );

  if (!res.ok) throw new Error("Failed to fetch review summary");
  return res.json();
}
