import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
const Footer = () => {
  return <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">TP</span>
              </div>
              <span className="font-bold text-xl">Trường Phúc   </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Cửa hàng công nghệ uy tín với dịch vụ bảo hành và hỗ trợ kỹ thuật chuyên nghiệp.
            </p>
            <div className="flex gap-3">
              <Button size="icon" variant="ghost" className="hover:text-primary">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost" className="hover:text-primary">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost" className="hover:text-primary">
                <Youtube className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Về chúng tôi
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Sản phẩm
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Chính sách bảo hành
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Hỗ trợ kỹ thuật
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Chính sách</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Chính sách đổi trả
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Điều khoản sử dụng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Thanh toán & Giao hàng
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>273/27/2 Nguyễn Đức Thuận, Phường Hiệp Thành(Hết hiệu lực), TP Hồ Chí Minh</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>0979113779</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>truongphucvn@gmail.com</span>
              </li>
            </ul>
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Đăng ký nhận tin</p>
              <div className="flex gap-2">
                <Input placeholder="Email của bạn" className="h-9" />
                <Button size="sm">Đăng ký</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t text-center text-sm text-muted-foreground">
          
        </div>
      </div>
    </footer>;
};
export default Footer;