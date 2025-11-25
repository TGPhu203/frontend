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
      {/* Sidebar */}
      <AdminSidebar
        collapsed={isSidebarCollapsed}
        onToggleCollapse={() =>
          setIsSidebarCollapsed((prev) => !prev)
        }
      />

      {/* Nội dung chính */}
      <main
        className={cn(
          "min-h-screen bg-gradient-to-b from-background via-background to-secondary/40",
          "transition-[margin-left] duration-300 p-4 lg:p-6",
          // margin-left theo trạng thái sidebar
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        )}
      >
        {/* HEADER */}
        <header className="sticky top-0 z-30 mb-6 flex items-center justify-between rounded-2xl border bg-card/80 px-4 py-3 shadow-sm backdrop-blur">
          <div className="flex flex-col">
            <span className="text-xs font-medium uppercase text-muted-foreground tracking-wide">
              Admin Panel
            </span>
            <span className="text-sm text-muted-foreground">
              Quản lý bán hàng & dịch vụ kỹ thuật
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-muted/60">
              <div className="h-9 w-9 rounded-full overflow-hidden bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold">
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

              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-medium leading-tight">
                  {user?.fullName || "Admin"}
                </span>
                <span className="text-[11px] text-muted-foreground leading-tight">
                  {user?.email || "admin@system.com"}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-red-200 text-red-500 hover:bg-red-500/10 hover:text-red-600"
              onClick={handleLogout}
              title="Đăng xuất"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Container nội dung dashboard */}
        <div className="mx-auto w-full max-w-6xl space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
};
