import { AdminLayout } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus, Eye, AlertCircle } from "lucide-react";

const AdminService = () => {
  const services = [
    { 
      id: 2001, 
      type: "Bảo hành", 
      customer: "Nguyễn Văn A", 
      product: "Laptop Dell XPS 15",
      date: "2024-01-15", 
      status: "processing",
      priority: "high",
      technician: "Kỹ thuật viên 1"
    },
    { 
      id: 2002, 
      type: "Sửa chữa", 
      customer: "Trần Thị B", 
      product: "iPhone 15 Pro Max",
      date: "2024-01-14", 
      status: "pending",
      priority: "medium",
      technician: "Chưa phân công"
    },
    { 
      id: 2003, 
      type: "Tư vấn", 
      customer: "Lê Văn C", 
      product: "Samsung Galaxy S24",
      date: "2024-01-14", 
      status: "processing",
      priority: "low",
      technician: "Kỹ thuật viên 2"
    },
    { 
      id: 2004, 
      type: "Lắp đặt", 
      customer: "Phạm Thị D", 
      product: "MacBook Pro M3",
      date: "2024-01-13", 
      status: "pending",
      priority: "high",
      technician: "Chưa phân công"
    },
    { 
      id: 2005, 
      type: "Kiểm tra", 
      customer: "Hoàng Văn E", 
      product: "iPad Pro 12.9",
      date: "2024-01-13", 
      status: "completed",
      priority: "medium",
      technician: "Kỹ thuật viên 3"
    },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Dịch vụ kỹ thuật</h1>
            <p className="text-muted-foreground">Quản lý yêu cầu bảo hành, sửa chữa và hỗ trợ</p>
          </div>
          <Button className="bg-gradient-primary">
            <Plus className="h-4 w-4 mr-2" />
            Tạo yêu cầu mới
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Tìm kiếm yêu cầu..." className="pl-10" />
          </div>
          <Button variant="outline">Lọc</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Chờ xử lý</p>
              <p className="text-2xl font-bold text-warning">2</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-warning" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Đang xử lý</p>
              <p className="text-2xl font-bold text-primary">2</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Hoàn thành</p>
              <p className="text-2xl font-bold text-success">1</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-success" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Mã YC</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Loại dịch vụ</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Khách hàng</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Sản phẩm</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Kỹ thuật viên</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Độ ưu tiên</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Trạng thái</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono font-medium text-primary">YC-{service.id}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-card-foreground">{service.type}</td>
                  <td className="px-6 py-4 text-sm text-card-foreground">{service.customer}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{service.product}</td>
                  <td className="px-6 py-4 text-sm text-card-foreground">{service.technician}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      service.priority === "high" ? "bg-destructive/10 text-destructive" :
                      service.priority === "medium" ? "bg-warning/10 text-warning" :
                      "bg-success/10 text-success"
                    }`}>
                      {service.priority === "high" ? "Cao" :
                       service.priority === "medium" ? "Trung bình" : "Thấp"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      service.status === "completed" ? "bg-success/10 text-success" :
                      service.status === "processing" ? "bg-primary/10 text-primary" :
                      "bg-warning/10 text-warning"
                    }`}>
                      {service.status === "completed" ? "Hoàn thành" :
                       service.status === "processing" ? "Đang xử lý" : "Chờ xử lý"}
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

export default AdminService;
