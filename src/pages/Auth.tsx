import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner"; // nếu bạn dùng sonner
import { login, register } from "@/api/authApi";
const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // SIGN IN FORM
  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");

  // SIGN UP FORM
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");

  /* =====================================================
     💠 HANDLE LOGIN
  ====================================================== */
  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      // login() trả về { user, token, refreshToken }
      const { user, token } = await login(signinEmail, signinPassword);
  
      if (!user) {
        throw new Error("Không nhận được thông tin người dùng");
      }
  
      // ⚠️ Nếu tài khoản bị khóa thì không cho đăng nhập
      if (user.isBlocked) {
        toast.error("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.");
        setIsLoading(false);
        return;
      }
  
      // Lưu toàn bộ user + token để chỗ khác dùng (Cart, Header,...)
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...user, // id, email, firstName, lastName, fullName, avatar, loyaltyTier,...
          token, // thêm token để call API nếu cần
        })
      );
  
      toast.success("Đăng nhập thành công");
  
      if (user.role === "admin") navigate("/admin");
      else navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Đăng nhập thất bại");
    } finally {
      setIsLoading(false);
    }
  };
  
  



  /* =====================================================
     💠 HANDLE REGISTER
  ====================================================== */
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (signupPassword !== signupConfirm) {
      toast.error("Mật khẩu xác nhận không khớp");
      setIsLoading(false);
      return;
    }

    try {
      const [firstName, ...rest] = signupName.split(" ");
      const lastName = rest.join(" ");

      const data = await register({
        firstName,
        lastName,
        email: signupEmail,
        password: signupPassword,
      });

      toast.success("Đăng ký thành công! Kiểm tra email xác thực.");

      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Không thể đăng ký");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại trang chủ
        </Link>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-2xl">T</span>
            </div>
            <CardTitle className="text-2xl">Trường Phúc</CardTitle>
            <CardDescription>Đăng nhập hoặc tạo tài khoản mới</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Đăng nhập</TabsTrigger>
                <TabsTrigger value="signup">Đăng ký</TabsTrigger>
              </TabsList>

              {/* SIGN IN */}
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={signinEmail}
                      onChange={(e) => setSigninEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label>Mật khẩu</Label>
                    <Input
                      type="password"
                      value={signinPassword}
                      onChange={(e) => setSigninPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                  </Button>
                </form>
              </TabsContent>

              {/* SIGN UP */}
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Label>Họ và tên</Label>
                    <Input
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label>Mật khẩu</Label>
                    <Input
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label>Xác nhận mật khẩu</Label>
                    <Input
                      type="password"
                      value={signupConfirm}
                      onChange={(e) => setSignupConfirm(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Đang tạo tài khoản..." : "Đăng ký"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Lưu ý: Backend phải chạy để đăng nhập & đăng ký hoạt động.
        </p>
      </div>
    </div>
  );
};

export default Auth;
