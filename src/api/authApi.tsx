const BASE_URL = "http://localhost:8888/api/auth";

/* ================= LOGIN ================= */
export async function login(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    credentials: "include",   // 🔥 QUAN TRỌNG
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Đăng nhập thất bại");
  }

  return json.data;
}


/* ================= REGISTER ================= */
export async function register(data) {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    credentials: "include",   // 🔥 thêm dòng này
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Đăng ký thất bại");
  }

  return json.data;
}

