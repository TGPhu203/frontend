import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

import { useEffect, useState } from "react";
import { getCategories } from "@/api/categoryApi";

const Categories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
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
      <div className="min-h-screen flex items-center justify-center text-lg">
        Đang tải danh mục...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-12 border-b">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">Danh mục sản phẩm</h1>
            <p className="text-muted-foreground max-w-2xl">
              Khám phá các danh mục sản phẩm công nghệ đa dạng với hàng ngàn sản phẩm chất lượng.
            </p>
          </div>
        </section>

        {/* CATEGORIES GRID */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link key={category._id} to={`/products?category=${category.slug}`}>
                  <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 h-full">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={category.image || "/placeholder.jpg"}
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
              ))}
            </div>
          </div>
        </section>

        {/* POPULAR */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Danh mục phổ biến</h2>
              <p className="text-muted-foreground">
                Các danh mục được khách hàng quan tâm nhiều nhất
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.slice(0, 4).map((category) => (
                <Link key={category._id} to={`/products?category=${category.slug}`}>
                  <Card className="group hover:shadow-md transition-all duration-300 hover:border-primary/50">
                    <CardContent className="p-6 text-center">
                      <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {category.productCount ?? 0} sản phẩm
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Categories;
