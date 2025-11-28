import { ReactNode, useState } from "react";
import { AdminSidebar } from "./component/AdminSidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const rawUser =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = rawUser ? JSON.parse(rawUser) : null;

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/auth";
  };

  return (
    <div className="admin-theme min-h-screen bg-background text-foreground">
      {/* Sidebar cố định */}
      <AdminSidebar
        collapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* Khối bên phải (header + content) */}
      <div
        className={cn(
          "min-h-screen transition-[margin-left] duration-300",
          isSidebarCollapsed ? "lg:ml-24" : "lg:ml-72",
          "ml-0"
        )}
      >
        {/* HEADER: gradient nhẹ + bóng mờ */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-gradient-to-r from-background via-sky-50/60 to-background px-4 py-4 shadow-sm md:px-6">
          <div className="flex flex-col">
          
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-full bg-muted/70 px-3 py-1.5 border border-white/60 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-sm font-semibold text-white shadow">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>
                    {user?.fullName?.charAt(0)?.toUpperCase() ||
                      user?.email?.charAt(0)?.toUpperCase() ||
                      "A"}
                  </span>
                )}
              </div>

              <div className="hidden flex-col sm:flex">
                <span className="text-sm font-medium leading-tight">
                  {user?.fullName || "Admin"}
                </span>
                <span className="text-[11px] leading-tight text-muted-foreground">
                  {user?.email || "admin@system.com"}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-red-200 bg-red-50/50 text-red-500 hover:bg-red-500/10 hover:text-red-600"
              onClick={handleLogout}
              title="Đăng xuất"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Nội dung chính */}
        <main className="px-4 py-4 md:px-6 md:py-6">
          <div
            className="mx-auto w-full max-w-6xl space-y-6"
            style={{ marginTop: -20 }}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
