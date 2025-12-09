// src/pages/VerifyEmailPage.tsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8888";

const VerifyEmailPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  // chống StrictMode gọi useEffect 2 lần
  const hasCalled = useRef(false);

  useEffect(() => {
    const verify = async () => {
      if (!token) return;

      try {
        const res = await fetch(
          `${API_BASE_URL}/api/auth/verify-email/${token}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.message || "Xác thực email thất bại");
        }

        setStatus("success");
        setMessage(json.data?.message || "Xác thực email thành công");
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Xác thực email thất bại");
      }
    };

    if (!hasCalled.current) {
      hasCalled.current = true;
      verify();
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <div className="max-w-md w-full bg-background shadow-md rounded-lg p-6 text-center space-y-4">
        {status === "loading" && (
          <>
            <h1 className="text-xl font-semibold">Đang xác thực email...</h1>
            <p>Vui lòng đợi trong giây lát.</p>
          </>
        )}

        {status === "success" && (
          <>
            <h1 className="text-xl font-semibold text-green-600">
              Xác thực email thành công
            </h1>
            <p>{message}</p>
            <button
              className="mt-4 px-4 py-2 rounded bg-primary text-primary-foreground"
              onClick={() => navigate("/auth")}
            >
              Đến trang đăng nhập
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-xl font-semibold text-red-600">
              Xác thực email thất bại
            </h1>
            <p>{message}</p>
            <button
              className="mt-4 px-4 py-2 rounded bg-primary text-primary-foreground"
              onClick={() => navigate("/auth")}
            >
              Quay lại trang đăng nhập
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
