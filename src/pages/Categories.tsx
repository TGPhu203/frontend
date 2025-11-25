import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { BASE_ORIGIN } from "@/api/Api";
import { useEffect, useState } from "react";
import { getCategories } from "@/api/categoryApi";

const Categories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCategories();
        setCategories(data || []);
      } catch (err) {
        console.error("Lỗi tải danh mục:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-gradient-to-b from-background via-background to-muted/40">
          <div className="flex flex-col items-center gap-3">
            <div className="h-9 w-9 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            <p className="text-sm text-muted-foreground">
              Đang tải danh mục sản phẩm...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-muted/30">
      <Header />

      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden border-b bg-gradient-to-r from-primary/10 via-primary/5 to-background">
          <div className="absolute inset-y-0 right-0 opacity-40 pointer-events-none">
            <div className="h-full w-[320px] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent_55%)]" />
          </div>

          <div className="container mx-auto px-4 py-12 relative">
          

            <div className="max-w-3xl space-y-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                Danh mục{" "}
                <span className="text-primary">sản phẩm công nghệ</span>
              </h1>
         
            </div>

            {categories.length > 0 && (
              <p className="mt-6 text-xs sm:text-sm text-muted-foreground">
                Hiện có{" "}
                <span className="font-semibold text-foreground">
                  {categories.length}
                </span>{" "}
                danh mục đang được hiển thị.
              </p>
            )}
          </div>
        </section>

        {/* CATEGORIES GRID */}
        <section className="py-14">
          <div className="container mx-auto px-4 space-y-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold">
                  Tất cả danh mục
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Chọn một danh mục để xem tất cả sản phẩm liên quan.
                </p>
              </div>
            </div>

            {categories.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <p className="text-sm text-muted-foreground">
                  Chưa có danh mục nào được cấu hình.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categories.map((category) => {
                  const imageUrl = category.image
                    ? category.image.startsWith("http")
                      ? category.image
                      : `${BASE_ORIGIN}${category.image.startsWith("/") ? "" : "/"
                      }${category.image}`
                    : "/placeholder.jpg";

                  return (
                    <Link key={category._id} to={`/products?category=${category.slug}`}>
                      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 h-full">
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={category.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <Badge className="absolute bottom-4 left-4 bg-background/90 text-foreground border-0">
                            {category.productCount ?? 0} sản phẩm
                          </Badge>
                        </div>

                        <CardContent className="p-6">
                          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {category.description || "Không có mô tả"}
                          </p>
                          <Button variant="ghost" size="sm" className="w-full">
                            Xem tất cả →
                          </Button>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}

              </div>
            )}
          </div>
        </section>

        {/* POPULAR */}
        {categories.length > 0 && (
          <section className="py-14 bg-secondary/25 border-t">
            <div className="container mx-auto px-4">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-semibold mb-2">
                  Danh mục nổi bật
                </h2>
                <p className="text-sm text-muted-foreground">
                  Những nhóm sản phẩm được khách hàng quan tâm nhiều nhất.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.slice(0, 4).map((category) => (
                  <Link
                    key={category._id}
                    to={`/products?category=${category.slug}`}
                    className="block"
                  >
                    <Card className="group hover:border-primary/60 hover:shadow-lg transition-all duration-300 rounded-2xl bg-card/80 backdrop-blur">
                      <CardContent className="p-5 text-center space-y-1.5">
                        <h3 className="font-semibold text-sm sm:text-base group-hover:text-primary transition-colors line-clamp-1">
                          {category.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {category.productCount ?? 0} sản phẩm
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Categories;
