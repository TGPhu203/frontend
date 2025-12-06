const BASE = "http://localhost:8888/api/cart";

export const addToCart = async (data: any) => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message);

  return json.data; // CHUẨN
};

export const getCart = async () => {
  const res = await fetch(BASE, {
    method: "GET",
    credentials: "include",
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message);

  return json.data; // CHUẨN
};

export const updateCartItem = async (id: string, quantity: number) => {
  const res = await fetch(`${BASE}/items/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ quantity }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message);

  return json.data; // CHUẨN
};

export const removeCartItem = async (id: string) => {
  const res = await fetch(`${BASE}/items/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message);

  return json.data; // CHUẨN
};
export const clearCart = async () => {
  const res = await fetch(BASE, {
    method: "DELETE",
    credentials: "include",
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message);

  return json.data; // chính là data của getCart
};