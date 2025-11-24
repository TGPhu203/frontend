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
// 🟦 Warranty package
// ===============================
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

  price: number;
  compareAtPrice?: number | null;

  images?: string[];

  description?: string;
  shortDescription?: string;

  searchKeywords?: string[];

  categories?: ProductCategory[];

  attributes?: any[];
  specifications?: Record<string, any>;

  reviews?: any[];
  ratings?: ProductRatings;

  variants?: ProductVariant[];
  isVariantProduct?: boolean;

  warrantyPackages?: WarrantyPackageItem[];

  stockQuantity?: number;
  inStock?: boolean;

  status?: string;

  createdAt?: string;
  updatedAt?: string;
}
