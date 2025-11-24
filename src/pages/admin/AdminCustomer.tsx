import { AdminLayout } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Eye, Mail, Phone } from "lucide-react";

const AdminCustomer = () => {
  const customers = [
    { id: 1, name: "Nguyễn Văn A", email: "nguyenvana@email.com", phone: "0901234567", orders: 12, total: 125000000 },
    { id: 2, name: "Trần Thị B", email: "tranthib@email.com", phone: "0912345678", orders: 8, total: 89000000 },
    { id: 3, name: "Lê Văn C", email: "levanc@email.com", phone: "0923456789", orders: 15, total: 156000000 },
    { id: 4, name: "Phạm Thị D", email: "phamthid@email.com", phone: "0934567890", orders: 5, total: 62000000 },
    { id: 5, name: "Hoàng Văn E", email: "hoangvane@email.com", phone: "0945678901", orders: 20, total: 234000000 },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Quản lý khách hàng</h1>
            <p className="text-muted-foreground">Danh sách khách hàng và lịch sử mua hàng</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Tìm kiếm khách hàng..." className="pl-10" />
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Khách hàng</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Liên hệ</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Số đơn</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Tổng chi tiêu</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary-foreground">
                          {customer.name.split(" ").slice(-1)[0].charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">ID: #{customer.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-card-foreground">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-card-foreground">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        {customer.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {customer.orders} đơn
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-card-foreground">
                    ₫{customer.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminLayout>
  );
};

export default AdminCustomer;
