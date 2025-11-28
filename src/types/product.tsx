// ===============================
// 🟦 Product Attribute
// ===============================
export interface AttributeOption {
  _id: string;
  name: string;
  priceAdjustment?: number;
  isDefault?: boolean;
}

export interface ProductAttribute {
  _id: string;
  name: string;
  options?: AttributeOption[];
}

// ===============================
// 🟦 Product Variant
// ===============================
export interface ProductVariant {
  _id: string;
  variantName: string;
  price: number;
  compareAtPrice?: number | null;
  sku?: string;
  stockQuantity?: number;
  isDefault?: boolean;
  isAvailable?: boolean;
  images?: string[];
  specifications?: Record<string, any>;
}

// ===============================
// 🟦 Product Category
// ===============================
export interface ProductCategory {
  _id: string;
  name: string;
  slug: string;
}

// ===============================
// 🟦 Product Ratings
// ===============================
export interface ProductRatings {
  average: number;
  count: number;
}

// ===============================
// 🟦 Product Specification (optional)
// ===============================
export interface ProductSpecification {
  key: string;
  value: string;
}

// ===============================
// 🟦 Warranty package (nếu dùng kiểu mới warrantyOptions)
// ===============================
export interface WarrantyOption {
  _id: string;
  name: string;
  description?: string;
  durationMonths?: number;
  basePrice?: number;
  price: number;
  isDefault?: boolean;
  productWarrantyId?: string;
}

// Nếu còn dùng kiểu cũ WarrantyPackageItem thì giữ luôn:
export interface WarrantyPackageItem {
  _id: string;
  warrantyPackage: {
    name: string;
    durationMonths: number;
    price: number;
  };
  isActive: boolean;
}

// ===============================
// 🟥 MAIN PRODUCT TYPE
// ===============================
export interface Product {
  _id: string;

  name: string;
  baseName?: string; // for variant products
  slug: string;

  // giá đã cộng thuộc tính mặc định ở backend
  price: number;
  compareAtPrice?: number | null;

  // backend có thể trả thêm:
  attributePriceAdjustment?: number;
  finalPrice?: number;
  finalCompareAtPrice?: number;

  images?: string[];

  description?: string;
  shortDescription?: string;

  searchKeywords?: string[];

  categories?: ProductCategory[];

  // attributes đã gõ type chuẩn
  attributes?: ProductAttribute[];

  specifications?: Record<string, any>;

  reviews?: any[];
  ratings?: ProductRatings;

  variants?: ProductVariant[];
  isVariantProduct?: boolean;

  // hai dạng bảo hành – dùng cái nào thì tuỳ backend
  warrantyPackages?: WarrantyPackageItem[];
  warrantyOptions?: WarrantyOption[];

  stockQuantity?: number;
  inStock?: boolean;

  status?: string;

  createdAt?: string;
  updatedAt?: string;
}
