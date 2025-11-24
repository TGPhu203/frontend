import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Truck, Headphones } from "lucide-react";
import heroProduct from "@/assets/hero-product.jpg";
const Hero = () => {
  return <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/30">
      <div className="container mx-auto px-4 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Công nghệ hàng đầu
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {" "}
                  cho cuộc sống hiện đại
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                Khám phá bộ sưu tập sản phẩm công nghệ cao cấp với dịch vụ bảo hành và hỗ trợ kỹ thuật chuyên nghiệp.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              
              
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-medium">Giao hàng nhanh</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-success" />
                </div>
                <span className="text-sm font-medium">Bảo hành chính hãng</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Headphones className="h-6 w-6 text-accent" />
                </div>
                <span className="text-sm font-medium">Hỗ trợ 24/7</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
              <img src={heroProduct} alt="Featured Product" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-xl border">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="font-semibold">Bảo hành 24 tháng</p>
                  <p className="text-sm text-muted-foreground">Hỗ trợ kỹ thuật miễn phí</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default Hero;