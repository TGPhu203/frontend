import { AdminLayout } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Eye, Download } from "lucide-react";

const AdminOrders = () => {
  const orders = [
    { id: 1001, customer: "Nguyễn Văn A", total: 35000000, items: 2, date: "2024-01-15", status: "completed" },
    { id: 1002, customer: "Trần Thị B", total: 29000000, items: 1, date: "2024-01-15", status: "processing" },
    { id: 1003, customer: "Lê Văn C", total: 44000000, items: 3, date: "2024-01-14", status: "pending" },
    { id: 1004, customer: "Phạm Thị D", total: 22000000, items: 1, date: "2024-01-14", status: "completed" },
    { id: 1005, customer: "Hoàng Văn E", total: 56000000, items: 4, date: "2024-01-13", status: "cancelled" },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Quản lý đơn hàng</h1>
            <p className="text-muted-foreground">Theo dõi và xử lý đơn hàng</p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Tìm kiếm đơn hàng..." className="pl-10" />
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Mã đơn</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Khách hàng</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Ngày đặt</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Số lượng</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Tổng tiền</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Trạng thái</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono font-medium text-primary">#{order.id}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-card-foreground">{order.customer}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{order.date}</td>
                  <td className="px-6 py-4 text-sm text-card-foreground">{order.items} sản phẩm</td>
                  <td className="px-6 py-4 text-sm font-semibold text-card-foreground">
                    ₫{order.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      order.status === "completed" ? "bg-success/10 text-success" :
                      order.status === "processing" ? "bg-primary/10 text-primary" :
                      order.status === "pending" ? "bg-warning/10 text-warning" :
                      "bg-destructive/10 text-destructive"
                    }`}>
                      {order.status === "completed" ? "Hoàn thành" :
                       order.status === "processing" ? "Đang xử lý" :
                       order.status === "pending" ? "Chờ xử lý" : "Đã hủy"}
                    </span>
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

export default AdminOrders;
