const BASE = "http://localhost:8888/api/categories";

const token = () => JSON.parse(localStorage.getItem("user") || "{}")?.token;

export const getCategories = async () => {
  const res = await fetch(BASE);
  const json = await res.json();
  return json.data;
};

export const createCategory = async (data: any) => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token()}`,
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json.data;
};

export const updateCategory = async (id: string, data: any) => {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token()}`,
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json.data;
};

export const deleteCategory = async (id: string) => {
  const res = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token()}`,
    },
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.message);
  }
};
