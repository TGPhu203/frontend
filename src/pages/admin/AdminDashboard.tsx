import { AdminLayout } from "./AdminLayout";
import { StatCard } from "./component/StatCard";
import { 
  ShoppingCart, 
  Package, 
  Users, 
  DollarSign,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Tổng quan về hoạt động kinh doanh và dịch vụ</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Tổng doanh thu"
          value="₫45.2M"
          change="+12% so với tháng trước"
          icon={DollarSign}
          trend="up"
          variant="primary"
        />
        <StatCard
          title="Đơn hàng mới"
          value="156"
          change="+8% so với tuần trước"
          icon={ShoppingCart}
          trend="up"
          variant="success"
        />
        <StatCard
          title="Sản phẩm"
          value="342"
          change="24 sản phẩm mới"
          icon={Package}
          variant="default"
        />
        <StatCard
          title="Khách hàng"
          value="1,248"
          change="+23% so với tháng trước"
          icon={Users}
          trend="up"
          variant="default"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">Đơn hàng gần đây</h3>
              <p className="text-sm text-muted-foreground">5 đơn hàng mới nhất</p>
            </div>
            <Button variant="outline" size="sm">Xem tất cả</Button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground">Đơn hàng #{1000 + i}</p>
                    <p className="text-sm text-muted-foreground">Khách hàng {i}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-card-foreground">₫{(Math.random() * 10 + 1).toFixed(1)}M</p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-success/10 text-success">
                    Hoàn thành
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">Yêu cầu dịch vụ</h3>
              <p className="text-sm text-muted-foreground">Dịch vụ kỹ thuật đang xử lý</p>
            </div>
            <Button variant="outline" size="sm">Xem tất cả</Button>
          </div>
          <div className="space-y-4">
            {[
              { id: 1, type: "Bảo hành", status: "processing", priority: "high" },
              { id: 2, type: "Sửa chữa", status: "pending", priority: "medium" },
              { id: 3, type: "Tư vấn", status: "processing", priority: "low" },
              { id: 4, type: "Lắp đặt", status: "pending", priority: "high" },
              { id: 5, type: "Kiểm tra", status: "completed", priority: "medium" },
            ].map((service) => (
              <div key={service.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    service.priority === "high" ? "bg-destructive/10" : 
                    service.priority === "medium" ? "bg-warning/10" : "bg-success/10"
                  }`}>
                    <AlertCircle className={`h-5 w-5 ${
                      service.priority === "high" ? "text-destructive" : 
                      service.priority === "medium" ? "text-warning" : "text-success"
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground">{service.type}</p>
                    <p className="text-sm text-muted-foreground">YC-{2000 + service.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    service.status === "completed" ? "bg-success/10 text-success" :
                    service.status === "processing" ? "bg-primary/10 text-primary" :
                    "bg-warning/10 text-warning"
                  }`}>
                    {service.status === "completed" ? "Hoàn thành" :
                     service.status === "processing" ? "Đang xử lý" : "Chờ xử lý"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Thao tác nhanh</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="h-auto py-6 flex flex-col items-center gap-2 bg-gradient-primary">
            <Package className="h-6 w-6" />
            <span>Thêm sản phẩm mới</span>
          </Button>
          <Button className="h-auto py-6 flex flex-col items-center gap-2" variant="outline">
            <ShoppingCart className="h-6 w-6" />
            <span>Tạo đơn hàng</span>
          </Button>
          <Button className="h-auto py-6 flex flex-col items-center gap-2" variant="outline">
            <TrendingUp className="h-6 w-6" />
            <span>Xem báo cáo</span>
          </Button>
        </div>
      </Card>
    </AdminLayout>
  );
};

export default AdminDashboard;
