"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Shield,
  Search,
  Clock,
  Wrench,
  Package,
  AlertCircle,
  Smartphone,
} from "lucide-react";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getAllWarrantyPackages,
  getWarrantyPackagesByProduct,
  // 👇 thêm hàm lookup theo IMEI
  lookupWarrantyByImei,
} from "@/api/warrantyApi";
import { createRepairRequest } from "@/api/repairApi";

// ================== TYPES ==================
type WarrantyPkg = {
  _id: string;
  name: string;
  description?: string;
  durationMonths: number;
  price: number;
  coverage?: string | string[];
  terms?: string;
  isActive: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
};

type WarrantyListResponse = {
  warrantyPackages: WarrantyPkg[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

type ProductWarrantyLookupResponse = {
  warrantyPackages: WarrantyPkg[];
  productId: string;
};

// giả định response tra cứu theo IMEI từ BE
type WarrantyByImeiResponse = {
  imei: string;
  productName?: string;
  productImage?: string;
  warrantyStatus?: "active" | "expired" | "void";
  warrantyStartAt?: string;
  warrantyEndAt?: string;
  warrantyPackageName?: string;
  warrantyDurationMonths?: number;
};

// ================== COMPONENT ==================
const Warranty = () => {
  // TAB GÓI BẢO HÀNH
  const [warrantyPackages, setWarrantyPackages] = useState<WarrantyPkg[]>([]);
  const [loadingPkg, setLoadingPkg] = useState(true);

  // TRA CỨU THEO PRODUCT (giữ lại cho admin/dev nếu cần)
  const [productIdInput, setProductIdInput] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] =
    useState<ProductWarrantyLookupResponse | null>(null);

  // TRA CỨU THEO IMEI (cho khách)
  const [imeiInput, setImeiInput] = useState("");
  const [imeiLoading, setImeiLoading] = useState(false);
  const [imeiResult, setImeiResult] = useState<WarrantyByImeiResponse | null>(
    null
  );
  const [repairName, setRepairName] = useState("");
  const [repairPhone, setRepairPhone] = useState("");
  const [repairEmail, setRepairEmail] = useState("");
  const [repairProduct, setRepairProduct] = useState("");
  const [repairImei, setRepairImei] = useState("");
  const [repairIssue, setRepairIssue] = useState("");
  const [repairPreferredTime, setRepairPreferredTime] = useState("");
  const [repairLoading, setRepairLoading] = useState(false);
  const [repairImeiLoading, setRepairImeiLoading] = useState(false);
  const handleSubmitRepair = async () => {
    if (!repairName.trim() || !repairPhone.trim() || !repairProduct.trim() || !repairIssue.trim()) {
      toast.error("Vui lòng nhập đầy đủ họ tên, số điện thoại, sản phẩm và mô tả vấn đề.");
      return;
    }

    setRepairLoading(true);
    try {
      await createRepairRequest({
        customerName: repairName.trim(),
        phone: repairPhone.trim(),
        email: repairEmail.trim() || undefined,
        productName: repairProduct.trim(),
        imei: repairImei.trim() || undefined,
        issueDescription: repairIssue.trim(),
        preferredTime: repairPreferredTime.trim() || undefined,
      });

      toast.success("Đã gửi yêu cầu sửa chữa. Kỹ thuật viên sẽ liên hệ với bạn.");
      // reset form
      setRepairName("");
      setRepairPhone("");
      setRepairEmail("");
      setRepairProduct("");
      setRepairImei("");
      setRepairIssue("");
      setRepairPreferredTime("");
    } catch (err: any) {
      toast.error(err?.message || "Không thể gửi yêu cầu sửa chữa.");
    } finally {
      setRepairLoading(false);
    }
  };
  const handleLookupProductByRepairImei = async () => {
    const imei = repairImei.trim();
    if (!imei) return;

    setRepairImeiLoading(true);
    try {
      const data = (await lookupWarrantyByImei(imei)) as WarrantyByImeiResponse;

      if (!data) {
        toast.info("Không tìm thấy thông tin bảo hành cho IMEI này.");
        return;
      }

      // auto-fill tên sản phẩm
      if (data.productName) {
        setRepairProduct(data.productName);
      }

      // nếu muốn, có thể show thêm toast
      // toast.success("Đã lấy thông tin sản phẩm từ IMEI.");
    } catch (err: any) {
      toast.error(err?.message || "Không thể tra cứu sản phẩm theo IMEI.");
    } finally {
      setRepairImeiLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const data = (await getAllWarrantyPackages({
          page: 1,
          limit: 20,
          isActive: true,
        })) as WarrantyListResponse;

        setWarrantyPackages(data.warrantyPackages || []);
      } catch (err: any) {
        toast.error(err.message || "Không thể tải gói bảo hành");
      } finally {
        setLoadingPkg(false);
      }
    };
    load();
  }, []);

  // ===== TRA CỨU THEO PRODUCT ID (DEV / ADMIN) =====
  const handleLookupByProduct = async () => {
    if (!productIdInput.trim()) {
      toast.error("Vui lòng nhập productId.");
      return;
    }

    setLookupLoading(true);
    setLookupResult(null);

    try {
      const data = (await getWarrantyPackagesByProduct(
        productIdInput.trim()
      )) as ProductWarrantyLookupResponse;

      setLookupResult(data);

      if (!data.warrantyPackages || data.warrantyPackages.length === 0) {
        toast.info("Sản phẩm này chưa được cấu hình gói bảo hành nào.");
      }
    } catch (err: any) {
      toast.error(
        err?.message || "Không thể tra cứu bảo hành cho productId này."
      );
    } finally {
      setLookupLoading(false);
    }
  };

  // ===== TRA CỨU THEO IMEI (CHO KHÁCH) =====
  const handleLookupByImei = async () => {
    if (!imeiInput.trim()) {
      toast.error("Vui lòng nhập IMEI.");
      return;
    }

    setImeiLoading(true);
    setImeiResult(null);

    try {
      const data = (await lookupWarrantyByImei(
        imeiInput.trim()
      )) as WarrantyByImeiResponse;

      if (!data) {
        toast.info("Không tìm thấy thông tin bảo hành cho IMEI này.");
        return;
      }

      setImeiResult(data);
    } catch (err: any) {
      toast.error(err?.message || "Không thể tra cứu bảo hành theo IMEI.");
    } finally {
      setImeiLoading(false);
    }
  };

  // MOCK LỊCH SỬ BẢO HÀNH
  const warrantyHistory = [
    {
      id: 1,
      product: 'MacBook Pro 14" M3',
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
      product: 'iPad Pro 12.9"',
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
        return (
          <Badge className="bg-success text-success-foreground">
            Hoàn thành
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-warning text-warning-foreground">
            Đang xử lý
          </Badge>
        );
      case "pending":
        return <Badge variant="secondary">Chờ xử lý</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderWarrantyStatus = (status?: string) => {
    if (!status) return null;
    if (status === "active") {
      return (
        <Badge className="bg-emerald-500 text-emerald-50">Còn hiệu lực</Badge>
      );
    }
    if (status === "expired") {
      return (
        <Badge variant="destructive" className="bg-red-500 text-white">
          Hết hạn
        </Badge>
      );
    }
    if (status === "void") {
      return <Badge variant="outline">Đã hủy</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
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
              Tra cứu chính sách bảo hành theo sản phẩm, đăng ký dịch vụ và quản
              lý yêu cầu sửa chữa của bạn.
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

            {/* ========== TAB TRA CỨU ========== */}
            <TabsContent value="lookup" className="space-y-8">
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-primary" />
                    Tra cứu bảo hành theo IMEI
                  </CardTitle>
                  <CardDescription>
                    Nhập mã IMEI in trên máy hoặc hóa đơn để kiểm tra thời hạn
                    và trạng thái bảo hành.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-[1.7fr,1.3fr]">
                    <div className="space-y-2">
                      <Label htmlFor="imei">Mã IMEI</Label>
                      <Input
                        id="imei"
                        placeholder="Ví dụ: 3598 1234 5678 901"
                        className="text-lg"
                        value={imeiInput}
                        onChange={(e) => setImeiInput(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Thường nằm ở mặt sau hộp, trong cài đặt máy hoặc trên
                        phiếu bảo hành.
                      </p>
                    </div>
                    <div className="rounded-lg border bg-muted/50 p-3 text-xs md:text-sm text-muted-foreground space-y-1">
                      <p className="font-semibold text-foreground">
                        Hướng dẫn nhanh:
                      </p>
                      <p>- Vào Cài đặt &gt; Giới thiệu &gt; IMEI.</p>
                      <p>- Hoặc quét mã QR / xem trên hóa đơn mua hàng.</p>
                    </div>
                  </div>

                  <Button
                    className="w-full mt-2"
                    size="lg"
                    onClick={handleLookupByImei}
                    disabled={imeiLoading}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    {imeiLoading ? "Đang tra cứu..." : "Tra cứu bảo hành"}
                  </Button>

                  {/* KẾT QUẢ TRA CỨU IMEI */}
                  {imeiResult && (
                    <div className="mt-6 border-t pt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">
                          Kết quả tra cứu
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          IMEI: {imeiResult.imei}
                        </span>
                      </div>

                      <div className="grid gap-4 md:grid-cols-[1.4fr,1.6fr]">
                        <div className="flex gap-3">
                          {imeiResult.productImage && (
                            <img
                              src={imeiResult.productImage}
                              alt={imeiResult.productName || "Sản phẩm"}
                              className="w-20 h-20 rounded-md border object-cover"
                            />
                          )}
                          <div>
                            <p className="font-semibold">
                              {imeiResult.productName || "Sản phẩm không rõ"}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2 items-center">
                              <span className="text-xs text-muted-foreground">
                                Trạng thái:
                              </span>
                              {renderWarrantyStatus(imeiResult.warrantyStatus)}
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Gói bảo hành:
                            </span>
                            <span className="font-medium">
                              {imeiResult.warrantyPackageName ||
                                "Bảo hành tiêu chuẩn"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Thời hạn gói:
                            </span>
                            <span>
                              {imeiResult.warrantyDurationMonths
                                ? `${imeiResult.warrantyDurationMonths} tháng`
                                : "Không rõ"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Ngày bắt đầu:
                            </span>
                            <span>
                              {imeiResult.warrantyStartAt
                                ? new Date(
                                  imeiResult.warrantyStartAt
                                ).toLocaleDateString("vi-VN")
                                : "-"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Ngày kết thúc:
                            </span>
                            <span>
                              {imeiResult.warrantyEndAt
                                ? new Date(
                                  imeiResult.warrantyEndAt
                                ).toLocaleDateString("vi-VN")
                                : "-"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Nếu thông tin bảo hành không chính xác, vui lòng liên hệ
                        hotline hỗ trợ để được kiểm tra lại.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>


              {/* Đăng ký dịch vụ sửa chữa (mock) */}
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
                      <Label htmlFor="repair-name">Họ tên</Label>
                      <Input
                        id="repair-name"
                        placeholder="Nguyễn Văn A"
                        value={repairName}
                        onChange={(e) => setRepairName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="repair-phone">Số điện thoại</Label>
                      <Input
                        id="repair-phone"
                        placeholder="0912345678"
                        value={repairPhone}
                        onChange={(e) => setRepairPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="repair-email">Email (tuỳ chọn)</Label>
                      <Input
                        id="repair-email"
                        placeholder="email@example.com"
                        value={repairEmail}
                        onChange={(e) => setRepairEmail(e.target.value)}
                      />
                    </div>

                    {/* IMEI + auto lookup sản phẩm */}
                    <div className="space-y-2">
                      <Label htmlFor="repair-imei">Mã IMEI</Label>
                      <div className="flex gap-2">
                        <Input
                          id="repair-imei"
                          placeholder="3598 1234 5678 901"
                          value={repairImei}
                          onChange={(e) => setRepairImei(e.target.value)}
                          onBlur={handleLookupProductByRepairImei} // 👈 nhập xong tự lookup
                        />
                        <Button
                          variant="outline"
                          type="button"
                          onClick={handleLookupProductByRepairImei}
                          disabled={repairImeiLoading || !repairImei.trim()}
                        >
                          <Search className="h-4 w-4 mr-1" />
                          {repairImeiLoading ? "Đang lấy" : "Lấy thông tin"}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Nhập IMEI để hệ thống tự động lấy thông tin sản phẩm (nếu có).
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="repair-product">Sản phẩm</Label>
                    <Input
                      id="repair-product"
                      placeholder='Ví dụ: iPhone 15 Pro Max'
                      value={repairProduct}
                      onChange={(e) => setRepairProduct(e.target.value)}
                    />
                    {repairProduct && (
                      <p className="text-xs text-muted-foreground">
                        Thông tin sản phẩm đã được lấy từ IMEI, bạn có thể chỉnh lại nếu cần.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="repair-preferred-time">
                      Thời gian liên hệ (tuỳ chọn)
                    </Label>
                    <Input
                      id="repair-preferred-time"
                      placeholder="Ví dụ: chiều tối sau 18h"
                      value={repairPreferredTime}
                      onChange={(e) => setRepairPreferredTime(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="issue">Mô tả vấn đề</Label>
                    <textarea
                      id="issue"
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
                      value={repairIssue}
                      onChange={(e) => setRepairIssue(e.target.value)}
                    />
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleSubmitRepair}
                    disabled={repairLoading}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    {repairLoading ? "Đang gửi yêu cầu..." : "Gửi yêu cầu"}
                  </Button>
                </CardContent>
              </Card>

            </TabsContent>

            {/* ========== TAB GÓI BẢO HÀNH ========== */}
            <TabsContent value="packages">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold mb-4">
                  Gói bảo hành mở rộng
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Nâng cấp gói bảo hành để được hưởng nhiều quyền lợi hơn
                </p>
              </div>

              {loadingPkg ? (
                <div className="text-center py-10 text-muted-foreground">
                  Đang tải gói bảo hành...
                </div>
              ) : warrantyPackages.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  Chưa có gói bảo hành nào được cấu hình.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  {warrantyPackages.map((pkg, index) => {
                    const price = pkg.price || 0;
                    const durationLabel = `${pkg.durationMonths} tháng`;
                    const popular = index === 1;

                    const coverageItems =
                      typeof pkg.coverage === "string"
                        ? [pkg.coverage]
                        : Array.isArray(pkg.coverage)
                          ? pkg.coverage
                          : [];

                    return (
                      <Card
                        key={pkg._id}
                        className={`relative border-muted ${popular
                          ? "ring-2 ring-primary shadow-lg scale-105"
                          : ""
                          }`}
                      >
                        {popular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <Badge className="bg-primary text-primary-foreground">
                              Phổ biến nhất
                            </Badge>
                          </div>
                        )}

                        <CardHeader>
                          <CardTitle className="text-2xl">
                            {pkg.name}
                          </CardTitle>

                          <CardDescription className="text-lg font-semibold text-foreground">
                            {durationLabel}
                          </CardDescription>

                          <div className="pt-4">
                            <div className="text-3xl font-bold">
                              {price === 0 ? (
                                "Miễn phí"
                              ) : (
                                <>
                                  {(price / 1_000_000).toFixed(1)}
                                  <span className="text-lg font-normal text-muted-foreground">
                                    {" "}
                                    triệu
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-3">
                          {pkg.description && (
                            <p className="text-sm text-muted-foreground">
                              {pkg.description}
                            </p>
                          )}

                          {coverageItems.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-sm font-semibold">
                                Phạm vi bảo hành:
                              </p>
                              <ul className="text-sm list-disc list-inside space-y-1">
                                {coverageItems.map((c, i) => (
                                  <li key={i}>{c}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {pkg.terms && (
                            <p className="text-xs text-muted-foreground">
                              Điều khoản: {pkg.terms}
                            </p>
                          )}

                          <div className="text-xs text-muted-foreground space-y-1 border-t pt-3 mt-2">
                            <div className="flex justify-between">
                              <span>Trạng thái:</span>
                              <span
                                className={
                                  pkg.isActive
                                    ? "text-green-600"
                                    : "text-red-500"
                                }
                              >
                                {pkg.isActive ? "Đang kích hoạt" : "Đã tắt"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Thứ tự hiển thị:</span>
                              <span>{pkg.sortOrder ?? 0}</span>
                            </div>
                            {pkg.createdAt && (
                              <div className="flex justify-between">
                                <span>Ngày tạo:</span>
                                <span>
                                  {new Date(
                                    pkg.createdAt
                                  ).toLocaleString("vi-VN")}
                                </span>
                              </div>
                            )}
                            {pkg.updatedAt && (
                              <div className="flex justify-between">
                                <span>Cập nhật:</span>
                                <span>
                                  {new Date(
                                    pkg.updatedAt
                                  ).toLocaleString("vi-VN")}
                                </span>
                              </div>
                            )}
                          </div>

                          <Button
                            className="w-full"
                            variant={popular ? "default" : "outline"}
                          >
                            {price === 0 ? "Đã kích hoạt" : "Mua ngay"}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

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
                    <h3 className="font-semibold mb-2">
                      Kỹ thuật viên chuyên nghiệp
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Đội ngũ có chứng chỉ quốc tế
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Package className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">
                      Linh kiện chính hãng
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      100% linh kiện nhập khẩu
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ========== TAB LỊCH SỬ ========== */}
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Lịch sử bảo hành & sửa chữa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {warrantyHistory.map((item) => (
                      <Card
                        key={item.id}
                        className="border-l-4 border-l-primary"
                      >
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
