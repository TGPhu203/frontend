import { BASE_ORIGIN } from "./Api";

// GET: danh sách wishlist
export const getWishlist = async () => {
  const res = await fetch(`${BASE_ORIGIN}/api/wishlist`, {
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json.data;
};

// POST: thêm SP vào wishlist
export const addToWishlist = async (productId: string) => {
  const res = await fetch(`${BASE_ORIGIN}/api/wishlist`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json.data;
};

// GET: kiểm tra sản phẩm có trong wishlist
export const checkWishlist = async (productId: string) => {
  const res = await fetch(`${BASE_ORIGIN}/api/wishlist/check/${productId}`, {
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json.inWishlist;
};

// DELETE: xoá 1 sản phẩm khỏi wishlist
export const removeFromWishlist = async (productId: string) => {
  const res = await fetch(`${BASE_ORIGIN}/api/wishlist/${productId}`, {
    method: "DELETE",
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json.data;
};

// DELETE: xoá tất cả
export const clearWishlist = async () => {
  const res = await fetch(`${BASE_ORIGIN}/api/wishlist`, {
    method: "DELETE",
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json.data;
};
