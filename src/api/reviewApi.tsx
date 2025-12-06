// src/api/reviewApi.ts
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8888/api";

export const getPurchasedProductsForReview = async () => {
  const res = await fetch(`${API_BASE_URL}/reviews/purchased-products`, {
    credentials: "include",
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Không lấy được danh sách sản phẩm đã mua");
  }

  return json.data as {
    _id: string;
    name: string;
    slug?: string;
    price?: number;
    thumbnail?: string | null;
    hasReviewed: boolean;
  }[];
};
