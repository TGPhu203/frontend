const BASE_URL = "http://localhost:8888/api/categories";

export async function getCategories() {
  const res = await fetch(BASE_URL);
  const data = await res.json();
  return data.data;
}

export async function getCategoryTree() {
  const res = await fetch(`${BASE_URL}/tree`);
  return (await res.json()).data;
}

export async function getFeaturedCategories() {
  const res = await fetch(`${BASE_URL}/featured`);
  return (await res.json()).data;
}

export async function getCategoryBySlug(slug: string) {
  const res = await fetch(`${BASE_URL}/slug/${slug}`);
  return (await res.json()).data;
}

export async function getCategoryById(id: string) {
  const res = await fetch(`${BASE_URL}/${id}`);
  return (await res.json()).data;
}

export async function getProductsByCategory(id: string, page = 1, limit = 10) {
  const res = await fetch(`${BASE_URL}/${id}/products?page=${page}&limit=${limit}`);
  return (await res.json()).data;
}
