const BASE_URL = "http://localhost:8888/api/auth";

/* ================= LOGIN ================= */
export async function login(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Đăng nhập thất bại");
  }

  return json.data; // <- trả đúng data
}

/* ================= REGISTER ================= */
export async function register(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Đăng ký thất bại");
  }

  return json.data;
}
