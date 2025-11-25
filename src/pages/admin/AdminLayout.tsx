import { ReactNode } from "react";
import { AdminSidebar } from "./component/AdminSidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    // Áp dụng theme admin
    <div className="admin-theme min-h-screen bg-background text-foreground">
      {/* Sidebar cố định bên trái */}
      <AdminSidebar />

      {/* Nội dung chính */}
      <main
        className="
          lg:ml-64
          p-4 lg:p-8
          min-h-screen
          bg-gradient-to-b from-background via-background to-secondary/40
          transition-colors duration-300
        "
      >
        {/* Container cho nội dung dashboard */}
        <div className="mx-auto w-full max-w-6xl space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
};
