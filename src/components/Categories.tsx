import { Laptop, Smartphone, Headphones, Watch, Monitor, Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const categories = [
  {
    name: "Laptop",
    icon: Laptop,
    count: 245,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    name: "Điện thoại",
    icon: Smartphone,
    count: 389,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    name: "Tai nghe",
    icon: Headphones,
    count: 156,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    name: "Đồng hồ",
    icon: Watch,
    count: 98,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    name: "Màn hình",
    icon: Monitor,
    count: 134,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    name: "Camera",
    icon: Camera,
    count: 87,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
];

const Categories = () => {
  return (
    <section className="py-16 lg:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-2">Danh mục sản phẩm</h2>
          <p className="text-muted-foreground">Tìm kiếm theo danh mục yêu thích của bạn</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Card
                key={category.name}
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 hover:border-primary/50"
              >
                <CardContent className="p-6 text-center">
                  <div className={`h-16 w-16 mx-auto mb-4 rounded-full ${category.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-8 w-8 ${category.color}`} />
                  </div>
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {category.count} sản phẩm
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;
