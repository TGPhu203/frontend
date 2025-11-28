import { BASE_ORIGIN } from "./Api";

// Helper chung
const handleResponse = async (res: Response) => {
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Có lỗi xảy ra");
  }
  return json;
};

// GET: danh sách wishlist
export const getWishlist = async () => {
  const res = await fetch(`${BASE_ORIGIN}/api/wishlist`, {
    credentials: "include",
  });
  const json = await handleResponse(res);
  // backend trả { status, data: [...] }
  return json.data ?? [];
};

// POST: thêm SP vào wishlist
export const addToWishlist = async (productId: string) => {
  const res = await fetch(`${BASE_ORIGIN}/api/wishlist`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId }),
  });
  const json = await handleResponse(res);
  // backend trả { status, message: '...' }
  return {
    message: json.message,
  };
};

// GET: kiểm tra sản phẩm có trong wishlist
export const checkWishlist = async (productId: string) => {
  const res = await fetch(`${BASE_ORIGIN}/api/wishlist/check/${productId}`, {
    credentials: "include",
  });
  const json = await handleResponse(res);
  // backend trả { status, data: { inWishlist: boolean } }
  return !!json.data?.inWishlist;
};

// DELETE: xoá 1 sản phẩm khỏi wishlist
export const removeFromWishlist = async (productId: string) => {
  const res = await fetch(`${BASE_ORIGIN}/api/wishlist/${productId}`, {
    method: "DELETE",
    credentials: "include",
  });
  const json = await handleResponse(res);
  return {
    message: json.message,
  };
};

// DELETE: xoá tất cả
export const clearWishlist = async () => {
  const res = await fetch(`${BASE_ORIGIN}/api/wishlist`, {
    method: "DELETE",
    credentials: "include",
  });
  const json = await handleResponse(res);
  return {
    message: json.message,
  };
};
