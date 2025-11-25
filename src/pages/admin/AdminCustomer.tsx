"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Eye, Mail, Phone, RefreshCw } from "lucide-react";
import { toast } from "sonner";

type Customer = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  orderCount?: number;
  totalSpent?: number;
};

const AdminCustomer = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "http://localhost:8888/api/admin/users?page=1&limit=50",
        {
          credentials: "include",
        }
      );
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Không thể tải danh sách khách hàng");
      }

      let data: any = json;
      if (Array.isArray(json)) {
        data = json;
      } else if (Array.isArray(json.data)) {
        data = json.data;
      } else if (Array.isArray(json.users)) {
        data = json.users;
      } else {
        data = [];
      }

      setCustomers(data);
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi tải danh sách khách hàng");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase();
    if (!keyword) return customers;

    return customers.filter((c) => {
      const name = `${c.firstName || ""} ${c.lastName || ""}`.toLowerCase();
      const email = c.email?.toLowerCase() || "";
      const phone = c.phone || "";
      return (
        name.includes(keyword) ||
        email.includes(keyword) ||
        phone.includes(keyword)
      );
    });
  }, [customers, search]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-background px-4 py-6 md:px-8 md:py-8 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Đang tải danh sách khách hàng...
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-background px-4 py-6 md:px-8 md:py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Khách hàng hệ thống
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
              Quản lý khách hàng
            </h1>
            <p className="text-sm text-muted-foreground">
              Danh sách khách hàng, thông tin liên hệ và thống kê đơn hàng cơ bản.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên, email, số điện thoại..."
                className="pl-9 h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-full"
              onClick={loadCustomers}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Làm mới
            </Button>
          </div>
        </div>

        {/* Table card */}
        <Card className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-4 py-3 md:px-6">
            <div>
              <p className="text-sm font-medium text-card-foreground">
                Danh sách khách hàng
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Tổng cộng {customers.length} khách hàng, đang hiển thị{" "}
                {filtered.length}.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-3 text-left font-medium">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left font-medium">
                    Liên hệ
                  </th>
                  <th className="px-6 py-3 text-left font-medium">
                    Số đơn
                  </th>
                  <th className="px-6 py-3 text-left font-medium">
                    Tổng chi tiêu
                  </th>
                  <th className="px-6 py-3 text-right font-medium">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {filtered.map((customer) => {
                  const fullName =
                    `${customer.firstName || ""} ${
                      customer.lastName || ""
                    }`.trim() || customer.email;
                  const initial =
                    fullName
                      .split(" ")
                      .slice(-1)[0]
                      ?.charAt(0)
                      .toUpperCase() || "?";

                  return (
                    <tr
                      key={customer._id}
                      className="hover:bg-muted/40 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center shadow-sm">
                            <span className="text-sm font-semibold text-primary-foreground">
                              {initial}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-card-foreground">
                              {fullName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ID: #{customer._id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-card-foreground">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{customer.email}</span>
                          </div>
                          {customer.phone && (
                            <div className="flex items-center gap-2 text-sm text-card-foreground">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                          {(customer.orderCount ?? 0).toString()} đơn
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-card-foreground">
                        ₫{(customer.totalSpent ?? 0).toLocaleString("vi-VN")}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-6 text-center text-sm text-muted-foreground"
                    >
                      Không tìm thấy khách hàng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminCustomer;
