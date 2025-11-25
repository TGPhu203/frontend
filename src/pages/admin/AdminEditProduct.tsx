import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { uploadSingle } from "@/api/uploadApi";
import { getCategories } from "@/api/categoryApi";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  defaultValue?: any;
}

export const AdminEditProduct = ({ open, onClose, onSubmit, defaultValue }: Props) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState<any>("");
  const [compareAtPrice, setCompareAtPrice] = useState<any>("");
  const [stockQuantity, setStockQuantity] = useState<any>("");

  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");

  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState("active");

  const [seoKeywords, setSeoKeywords] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getCategories();
        setAllCategories(data);
      } catch {
        toast.error("Không tải được danh mục");
      }
    })();
  }, []);

  useEffect(() => {
    if (defaultValue) {
      setName(defaultValue.name || "");
      setPrice(defaultValue.price || "");
      setCompareAtPrice(defaultValue.compareAtPrice || "");

      // *** FIX QUAN TRỌNG ***
      setStockQuantity(defaultValue.stockQuantity || "");

      setShortDescription(defaultValue.shortDescription || "");
      setDescription(defaultValue.description || "");

      setFeatured(defaultValue.featured || false);
      setStatus(defaultValue.status || "active");

      setSeoKeywords(defaultValue.searchKeywords?.join(", ") || "");
      setImages(defaultValue.images || []);
      setSelectedCategory(defaultValue.categories?.[0]?._id || "");
    } else {
      setName("");
      setPrice("");
      setCompareAtPrice("");
      setStockQuantity("");
      setShortDescription("");
      setDescription("");
      setFeatured(false);
      setStatus("active");
      setSeoKeywords("");
      setImages([]);
      setSelectedCategory("");
    }
  }, [defaultValue]);

  const handleUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadSingle(file, "products");
      setImages((prev) => [...prev, res.data.url]);
      toast.success("Upload ảnh thành công");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSubmit = () => {
    if (!name || !price || !stockQuantity || !shortDescription || !description) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    onSubmit({
      name,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,

      // *** FIX QUAN TRỌNG ***
      stockQuantity: Number(stockQuantity),

      shortDescription,
      description,
      featured,
      status,
      searchKeywords: seoKeywords.split(",").map((s) => s.trim()),
      images,
      categories: [selectedCategory],
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{defaultValue ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <Input placeholder="Tên sản phẩm" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Giá" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          <Input placeholder="Giá cũ" type="number" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} />

          {/* FIX: STOCK -> STOCK QUANTITY */}
          <Input placeholder="Kho hàng" type="number" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} />

          <select className="border rounded p-2" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="">-- Chọn danh mục --</option>
            {allCategories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          <select className="border rounded p-2" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">Đang bán</option>
            <option value="inactive">Ngừng bán</option>
          </select>

          <div className="flex items-center gap-2">
            <Checkbox checked={featured} onCheckedChange={(v) => setFeatured(!!v)} />
            <label>Sản phẩm nổi bật</label>
          </div>
        </div>

        <Textarea className="mt-3" placeholder="Mô tả ngắn..." value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
        <Textarea className="mt-3 h-32" placeholder="Mô tả chi tiết..." value={description} onChange={(e) => setDescription(e.target.value)} />

        <Input className="mt-3" placeholder="Từ khoá SEO" value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} />

        <div className="mt-4 space-y-2">
          <Input type="file" accept="image/*" onChange={handleUpload} />
          <div className="flex gap-3 flex-wrap">
            {images.map((img, i) => (
              <div key={i} className="relative">
                <img src={img} className="w-20 h-20 rounded object-cover border" />
                <button onClick={() => removeImage(img)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2">x</button>
              </div>
            ))}
          </div>
        </div>

        <Button className="w-full mt-4" onClick={handleSubmit}>
          {defaultValue ? "Cập nhật sản phẩm" : "Thêm mới"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
