import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Search,
  CheckCircle2,
  Clock,
  Wrench,
  Package,
  FileText,
  AlertCircle,
} from "lucide-react";

const Warranty = () => {
  const warrantyPackages = [
    {
      id: 1,
      name: "Bảo hành cơ bản",
      duration: "12 tháng",
      price: 0,
      features: [
        "Bảo hành lỗi nhà sản xuất",
        "Hỗ trợ kỹ thuật cơ bản",
        "Sửa chữa miễn phí",
        "Đổi mới trong 7 ngày đầu",
      ],
      color: "border-muted",
    },
    {
      id: 2,
      name: "Bảo hành mở rộng",
      duration: "24 tháng",
      price: 2990000,
      features: [
        "Tất cả quyền lợi gói cơ bản",
        "Bảo hành rơi vỡ, vào nước",
        "Đổi mới trong 30 ngày",
        "Vệ sinh bảo dưỡng miễn phí",
        "Hỗ trợ tận nhà",
      ],
      color: "border-primary",
      popular: true,
    },
    {
      id: 3,
      name: "Bảo hành VIP",
      duration: "36 tháng",
      price: 4990000,
      features: [
        "Tất cả quyền lợi gói mở rộng",
        "Đổi mới trong 60 ngày",
        "Máy dự phòng khi sửa chữa",
        "Ưu tiên xử lý nhanh",
        "Bảo hành linh kiện trọn đời",
        "Tư vấn công nghệ 24/7",
      ],
      color: "border-accent",
    },
  ];

  const warrantyHistory = [
    {
      id: 1,
      product: "MacBook Pro 14\" M3",
      serialNumber: "C02XY1234ABC",
      status: "completed",
      date: "15/11/2024",
      issue: "Thay pin",
      technician: "Nguyễn Văn A",
    },
    {
      id: 2,
      product: "iPhone 15 Pro Max",
      serialNumber: "F9VXY5678DEF",
      status: "processing",
      date: "20/11/2024",
      issue: "Thay màn hình",
      technician: "Trần Thị B",
    },
    {
      id: 3,
      product: "iPad Pro 12.9\"",
      serialNumber: "DMPY9012GHI",
      status: "pending",
      date: "22/11/2024",
      issue: "Lỗi sạc",
      technician: "Chưa phân công",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success text-success-foreground">Hoàn thành</Badge>;
      case "processing":
        return <Badge className="bg-warning text-warning-foreground">Đang xử lý</Badge>;
      case "pending":
        return <Badge variant="secondary">Chờ xử lý</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-12 border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-bold">Bảo hành & Dịch vụ</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Tra cứu bảo hành, đăng ký dịch vụ và quản lý yêu cầu sửa chữa của bạn
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <Tabs defaultValue="lookup" className="space-y-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="lookup">Tra cứu</TabsTrigger>
              <TabsTrigger value="packages">Gói bảo hành</TabsTrigger>
              <TabsTrigger value="history">Lịch sử</TabsTrigger>
            </TabsList>

            {/* Warranty Lookup */}
            <TabsContent value="lookup" className="space-y-8">
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-primary" />
                    Tra cứu thông tin bảo hành
                  </CardTitle>
                  <CardDescription>
                    Nhập mã sản phẩm hoặc số serial để kiểm tra thông tin bảo hành
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="serial">Số serial / IMEI</Label>
                    <Input
                      id="serial"
                      placeholder="Ví dụ: C02XY1234ABC"
                      className="text-lg"
                    />
                  </div>
                  <Button className="w-full" size="lg">
                    <Search className="mr-2 h-4 w-4" />
                    Tra cứu
                  </Button>

                  <div className="pt-6 border-t">
                    <h3 className="font-semibold mb-4">Thông tin bảo hành</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sản phẩm:</span>
                        <span className="font-medium">MacBook Pro 14" M3</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ngày mua:</span>
                        <span className="font-medium">15/11/2023</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Thời hạn:</span>
                        <span className="font-medium">24 tháng</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Còn lại:</span>
                        <Badge className="bg-success text-success-foreground">
                          12 tháng
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Trạng thái:</span>
                        <Badge className="bg-success text-success-foreground">
                          Còn bảo hành
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    Tải chứng nhận bảo hành
                  </Button>
                </CardContent>
              </Card>

              {/* Service Request */}
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-primary" />
                    Đăng ký dịch vụ sửa chữa
                  </CardTitle>
                  <CardDescription>
                    Gửi yêu cầu sửa chữa và kỹ thuật viên sẽ liên hệ với bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Họ tên</Label>
                      <Input id="name" placeholder="Nguyễn Văn A" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input id="phone" placeholder="0912345678" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product">Sản phẩm</Label>
                    <Input id="product" placeholder="MacBook Pro 14&quot; M3" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="issue">Mô tả vấn đề</Label>
                    <textarea
                      id="issue"
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
                    />
                  </div>
                  <Button className="w-full" size="lg">
                    <Package className="mr-2 h-4 w-4" />
                    Gửi yêu cầu
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Warranty Packages */}
            <TabsContent value="packages">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Gói bảo hành mở rộng</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Nâng cấp gói bảo hành để được hưởng nhiều quyền lợi hơn
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {warrantyPackages.map((pkg) => (
                  <Card
                    key={pkg.id}
                    className={`relative ${pkg.color} ${
                      pkg.popular ? "ring-2 ring-primary shadow-lg scale-105" : ""
                    }`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground">
                          Phổ biến nhất
                        </Badge>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                      <CardDescription className="text-lg font-semibold text-foreground">
                        {pkg.duration}
                      </CardDescription>
                      <div className="pt-4">
                        <div className="text-3xl font-bold">
                          {pkg.price === 0 ? (
                            "Miễn phí"
                          ) : (
                            <>
                              {(pkg.price / 1000000).toFixed(1)}
                              <span className="text-lg font-normal text-muted-foreground">
                                {" "}
                                triệu
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        {pkg.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        className="w-full"
                        variant={pkg.popular ? "default" : "outline"}
                      >
                        {pkg.price === 0 ? "Đã kích hoạt" : "Mua ngay"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Benefits */}
              <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Bảo vệ toàn diện</h3>
                    <p className="text-sm text-muted-foreground">
                      Bảo hành mọi lỗi kỹ thuật
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Xử lý nhanh</h3>
                    <p className="text-sm text-muted-foreground">
                      Cam kết sửa chữa trong 3-5 ngày
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Wrench className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Kỹ thuật viên chuyên nghiệp</h3>
                    <p className="text-sm text-muted-foreground">
                      Đội ngũ có chứng chỉ quốc tế
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Package className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Linh kiện chính hãng</h3>
                    <p className="text-sm text-muted-foreground">
                      100% linh kiện nhập khẩu
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Warranty History */}
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Lịch sử bảo hành & sửa chữa</CardTitle>
                  <CardDescription>
                    Theo dõi tất cả các yêu cầu dịch vụ của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {warrantyHistory.map((item) => (
                      <Card key={item.id} className="border-l-4 border-l-primary">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-lg">
                                  {item.product}
                                </h3>
                                {getStatusBadge(item.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                S/N: {item.serialNumber}
                              </p>
                              <div className="flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span>{item.date}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Wrench className="h-4 w-4 text-muted-foreground" />
                                  <span>{item.issue}</span>
                                </div>
                              <div className="flex items-center gap-1">
                                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                  <span>KTV: {item.technician}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                Chi tiết
                              </Button>
                              {item.status === "completed" && (
                                <Button variant="outline" size="sm">
                                  Đánh giá
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Warranty;
