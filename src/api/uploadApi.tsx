const BASE_URL = "http://localhost:8888/api/upload";

export async function uploadSingle(file: File, type: string = "products") {
  const formData = new FormData();
  formData.append("file", file);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user?.token || "";

  const res = await fetch(`${BASE_URL}/${type}/single`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Upload thất bại");
  }

  return res.json(); // { data: { url: "/uploads/products/xxx.jpg" } }
}
