import { Navigate } from "react-router-dom";

interface UserData {
  id: string;
  token: string;
  role: string;
}

const getUser = (): UserData | null => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as UserData) : null;
  } catch {
    return null;
  }
};

interface AdminRouteProps {
  children: JSX.Element;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const user = getUser();

  if (!user || !user.token) {
    return <Navigate to="/auth" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
