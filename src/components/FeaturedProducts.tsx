import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const mockProducts = [
  {
    id: "1",
    name: "Laptop Gaming ROG Strix G16",
    price: 32990000,
    originalPrice: 39990000,
    image: "/placeholder.svg",
    rating: 4.8,
    reviewCount: 156,
    warranty: "24 tháng",
    inStock: true,
  },
  {
    id: "2",
    name: "iPhone 15 Pro Max 256GB",
    price: 31990000,
    originalPrice: 34990000,
    image: "/placeholder.svg",
    rating: 4.9,
    reviewCount: 243,
    warranty: "12 tháng",
    inStock: true,
  },
  {
    id: "3",
    name: "Samsung Galaxy S24 Ultra",
    price: 27990000,
    image: "/placeholder.svg",
    rating: 4.7,
    reviewCount: 189,
    warranty: "12 tháng",
    inStock: true,
  },
  {
    id: "4",
    name: "MacBook Air M3 13 inch",
    price: 28990000,
    originalPrice: 31990000,
    image: "/placeholder.svg",
    rating: 4.9,
    reviewCount: 312,
    warranty: "12 tháng",
    inStock: true,
  },
  {
    id: "5",
    name: "iPad Pro 11 inch M4",
    price: 24990000,
    image: "/placeholder.svg",
    rating: 4.8,
    reviewCount: 167,
    warranty: "12 tháng",
    inStock: true,
  },
  {
    id: "6",
    name: "Sony WH-1000XM5 Wireless",
    price: 7990000,
    originalPrice: 9990000,
    image: "/placeholder.svg",
    rating: 4.9,
    reviewCount: 421,
    warranty: "12 tháng",
    inStock: true,
  },
  {
    id: "7",
    name: "Samsung OLED TV 55 inch",
    price: 19990000,
    image: "/placeholder.svg",
    rating: 4.6,
    reviewCount: 98,
    warranty: "24 tháng",
    inStock: false,
  },
  {
    id: "8",
    name: "Apple Watch Series 9 GPS",
    price: 9990000,
    originalPrice: 11990000,
    image: "/placeholder.svg",
    rating: 4.7,
    reviewCount: 234,
    warranty: "12 tháng",
    inStock: true,
  },
];

const FeaturedProducts = () => {
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-2">Sản phẩm nổi bật</h2>
            <p className="text-muted-foreground">Khám phá những sản phẩm công nghệ hàng đầu</p>
          </div>
          <Button variant="outline" className="hidden md:flex">
            Xem tất cả
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        <div className="flex justify-center mt-8 md:hidden">
          <Button variant="outline">
            Xem tất cả sản phẩm
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
