import { ReactNode } from "react";
import { AdminSidebar } from "./component/AdminSidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="lg:ml-64 p-4 lg:p-8">
        {children}
      </main>
    </div>
  );
};
