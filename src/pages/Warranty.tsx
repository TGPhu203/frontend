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
import { BASE_ORIGIN } from "@/api/Api";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getAllWarrantyPackages,
  getWarrantyPackagesByProduct,
  lookupWarrantyByImei,
} from "@/api/warrantyApi";
import {
  createRepairRequest,
  getMyRepairRequests,
  type RepairHistoryItem,
} from "@/api/repairApi";

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

// response tra cứu theo IMEI từ BE
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
  // TAB hiện tại
  const [tab, setTab] = useState<"lookup" | "packages" | "history">("lookup");

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

  // FORM ĐĂNG KÝ SỬA CHỮA
  const [repairName, setRepairName] = useState("");
  const [repairPhone, setRepairPhone] = useState("");
  const [repairEmail, setRepairEmail] = useState("");
  const [repairProduct, setRepairProduct] = useState("");
  const [repairImei, setRepairImei] = useState("");
  const [repairIssue, setRepairIssue] = useState("");
  const [repairPreferredTime, setRepairPreferredTime] = useState("");
  const [repairLoading, setRepairLoading] = useState(false);
  const [repairImeiLoading, setRepairImeiLoading] = useState(false);

  // LỊCH SỬ BẢO HÀNH / SỬA CHỮA
  const [repairHistory, setRepairHistory] = useState<RepairHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // ================== SUBMIT YÊU CẦU SỬA CHỮA ==================
  const handleSubmitRepair = async () => {
    if (
      !repairName.trim() ||
      !repairPhone.trim() ||
      !repairProduct.trim() ||
      !repairIssue.trim()
    ) {
      toast.error(
        "Vui lòng nhập đầy đủ họ tên, số điện thoại, sản phẩm và mô tả vấn đề."
      );
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

      toast.success(
        "Đã gửi yêu cầu sửa chữa. Kỹ thuật viên sẽ liên hệ với bạn."
      );
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

      if (data.productName) {
        setRepairProduct(data.productName);
      }
    } catch (err: any) {
      toast.error(err?.message || "Không thể tra cứu sản phẩm theo IMEI.");
    } finally {
      setRepairImeiLoading(false);
    }
  };

  // load gói bảo hành
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

  // TRA CỨU THEO PRODUCT ID (DEV / ADMIN)
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

  // TRA CỨU THEO IMEI (CHO KHÁCH)
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

  // Badge trạng thái bảo hành
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

  // Badge trạng thái yêu cầu sửa chữa
  const getRepairStatusBadge = (status: string) => {
    switch (status) {
      case "new":
      case "pending":
        return <Badge variant="secondary">Chờ xử lý</Badge>;
      case "in_progress":
      case "processing":
        return (
          <Badge className="bg-warning text-warning-foreground">
            Đang xử lý
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-success text-success-foreground">
            Hoàn thành
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="text-red-500 border-red-300">
            Đã hủy
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // load lịch sử khi vào tab history
  const fetchRepairHistory = async () => {
    try {
      setHistoryLoading(true);
      const data = await getMyRepairRequests();
      setRepairHistory(data);
    } catch (err: any) {
      toast.error(
        err?.message || "Không thể tải lịch sử bảo hành/sửa chữa của bạn."
      );
    } finally {
      setHistoryLoading(false);
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
              Tra cứu chính sách bảo hành theo sản phẩm, đăng ký dịch vụ và quản
              lý yêu cầu sửa chữa của bạn.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <Tabs
            value={tab}
            onValueChange={(v) => {
              const val = v as "lookup" | "packages" | "history";
              setTab(val);
              if (val === "history") {
                fetchRepairHistory();
              }
            }}
            className="space-y-8"
          >
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
                              src={
                                imeiResult.productImage.startsWith("http")
                                  ? imeiResult.productImage
                                  : `${BASE_ORIGIN}${imeiResult.productImage}`
                              }
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

              {/* Đăng ký dịch vụ sửa chữa */}
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
                          onBlur={handleLookupProductByRepairImei}
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
                        Nhập IMEI để hệ thống tự động lấy thông tin sản phẩm
                        (nếu có).
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
                        Thông tin sản phẩm đã được lấy từ IMEI, bạn có thể chỉnh
                        lại nếu cần.
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
                      onChange={(e) =>
                        setRepairPreferredTime(e.target.value)
                      }
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
              {/* ... giữ nguyên phần packages như bạn đang có ... */}
              {/* (đoạn này không đổi so với code bạn gửi) */}
              {/* To avoid repeating, bạn copy lại nguyên block "packages" ở trên vào đây */}
              {/* Nội dung trong câu trả lời trước của tôi đã đúng, bạn đã paste rồi */}
              {/* => Bạn chỉ cần giữ nguyên phần đó, không phải sửa thêm */}
            </TabsContent>

            {/* ========== TAB LỊCH SỬ ========== */}
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Lịch sử bảo hành & sửa chữa</CardTitle>
                  <CardDescription>
                    Danh sách các yêu cầu sửa chữa / bảo hành bạn đã gửi.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {historyLoading ? (
                    <div className="text-center py-6 text-muted-foreground">
                      Đang tải lịch sử...
                    </div>
                  ) : repairHistory.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      Bạn chưa có yêu cầu sửa chữa/bảo hành nào.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {repairHistory.map((item) => (
                        <Card
                          key={item._id}
                          className="border-l-4 border-l-primary"
                        >
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  <h3 className="font-semibold text-lg">
                                    {item.productName}
                                  </h3>
                                  {getRepairStatusBadge(item.status)}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  IMEI: {item.imei || "—"}
                                </p>
                                <div className="flex flex-wrap gap-4 text-sm">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>
                                      {new Date(
                                        item.createdAt
                                      ).toLocaleString("vi-VN")}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Wrench className="h-4 w-4 text-muted-foreground" />
                                    <span>
                                      {item.issueDescription ||
                                        "Không có mô tả chi tiết"}
                                    </span>
                                  </div>
                                  {item.adminNotes && (
                                    <div className="flex items-center gap-1">
                                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                      <span>Ghi chú: {item.adminNotes}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              {/* sau này nếu có “Chi tiết / Đánh giá” thì thêm nút ở đây */}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
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
