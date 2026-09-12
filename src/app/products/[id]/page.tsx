"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, ShoppingCart, Star, Shield, Truck, RotateCcw } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  brand?: string;
  price: number;
  discount_price?: number;
  discountPrice?: number;
  rating?: number;
  review_count?: number;
  image_url?: string;
  image?: string;
  storage?: string;
  color?: string;
  display?: string;
  chip?: string;
  camera?: string;
  badge?: "SALE" | "NEW" | "HOT";
  description?: string;
  stock?: number;
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedStorage, setSelectedStorage] = useState<string>("");

  useEffect(() => {
    // We fetch all products and find the matching one
    // since there's no specific API endpoint for single product currently
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.products && data.products.length > 0) {
          const found = data.products.find((p: any) => String(p.id) === String(id));
          if (found) {
            setProduct(found);
            if (found.color) setSelectedColor(found.color.split(",")[0].trim());
            else setSelectedColor("Default");
            
            if (found.storage) setSelectedStorage(found.storage.split(",")[0].trim());
            else setSelectedStorage("128GB");
          }
        }
      })
      .catch((err) => console.error("Failed to fetch product:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 size={40} className="animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-medium">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="text-6xl mb-6">📱</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Product Not Found</h1>
        <p className="text-slate-500 mb-8 max-w-md text-center">
          We couldn't find the product you're looking for. It may have been removed or the link might be broken.
        </p>
        <button 
          onClick={() => router.push("/products")}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
        >
          Back to Products
        </button>
      </div>
    );
  }

  const displayImage = product.image_url || product.image || "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=80";
  const actualPrice = product.discount_price || product.discountPrice || product.price;
  const inStock = product.stock !== 0;

  // Generate realistic options for user selection if the db only provides one string
  const getOptions = (dbValue: string | undefined, defaults: string[]) => {
    if (!dbValue) return defaults;
    const dbOptions = dbValue.split(",").map(v => v.trim());
    if (dbOptions.length > 1) return dbOptions; // DB already has multiple choices
    
    // If DB only has 1, add it to defaults if not present, and return a set of choices
    const combined = [dbOptions[0], ...defaults.filter(d => d.toLowerCase() !== dbOptions[0].toLowerCase())];
    // return max 4 choices for UI simplicity
    return combined.slice(0, 4);
  };

  const availableColors = getOptions(product.color, ["Space Black", "Silver", "Titanium", "Gold"]);
  const availableStorages = getOptions(product.storage, ["128GB", "256GB", "512GB", "1TB"]);

  const handleAddToCart = () => {
    if (!inStock) return;
    
    addItem({
      productId: String(product.id),
      name: product.name,
      brand: product.brand || "Brand",
      price: actualPrice,
      image: displayImage,
      quantity: 1,
      storage: selectedStorage || product.storage,
      color: selectedColor || product.color,
    });
    
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb / Back button */}
        <Link 
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to all products
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            
            {/* Image Gallery Area */}
            <div className="p-8 md:p-12 lg:p-16 flex items-center justify-center bg-white border-b md:border-b-0 md:border-r border-slate-100">
              <img 
                src={displayImage} 
                alt={product.name}
                className="max-w-full h-auto max-h-[500px] object-contain drop-shadow-xl mix-blend-multiply"
              />
            </div>

            {/* Product Info Area */}
            <div className="p-8 md:p-12">
              {product.brand && (
                <span className="text-sm font-bold text-blue-600 tracking-wider uppercase mb-3 block">
                  {product.brand}
                </span>
              )}
              
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" className="text-slate-200" />
                  <span className="text-sm font-semibold text-slate-600 ml-1">
                    {product.rating || "4.5"} ({product.review_count || "128"} reviews)
                  </span>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-end gap-3 mb-2">
                  <span className="text-4xl font-extrabold text-slate-900">
                    ${actualPrice.toLocaleString()}
                  </span>
                  {(product.discount_price || product.discountPrice) && (
                    <span className="text-xl font-medium text-slate-400 line-through mb-1">
                      ${product.price.toLocaleString()}
                    </span>
                  )}
                </div>
                {inStock ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-bold">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    In Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-bold">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Color Selection */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Color</h3>
                <div className="flex flex-wrap gap-3">
                  {availableColors.map((colorOption) => (
                    <button
                      key={colorOption}
                      onClick={() => setSelectedColor(colorOption)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 ${
                        selectedColor === colorOption
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {colorOption}
                    </button>
                  ))}
                </div>
              </div>

              {/* Storage Selection */}
              <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Storage</h3>
                <div className="flex flex-wrap gap-3">
                  {availableStorages.map((storageOption) => (
                    <button
                      key={storageOption}
                      onClick={() => setSelectedStorage(storageOption)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 ${
                        selectedStorage === storageOption
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {storageOption}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-10">
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className={`flex-1 h-14 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                    added
                      ? "bg-green-500 text-white"
                      : !inStock
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200"
                  }`}
                >
                  {added ? (
                    "Added to Cart!"
                  ) : (
                    <>
                      <ShoppingCart size={20} />
                      {inStock ? "Add to Cart" : "Out of Stock"}
                    </>
                  )}
                </button>
              </div>

              {/* Description */}
              <div className="prose prose-slate max-w-none mb-10">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Product Description</h3>
                <p className="text-slate-600 leading-relaxed">
                  {product.description || "Experience next-level performance and design with this premium smartphone. Featuring a stunning display, advanced camera system, and all-day battery life, it's designed to keep up with your busy lifestyle while keeping you connected in style."}
                </p>
              </div>

              {/* Features / Guarantees */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-slate-100">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Truck size={20} />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Free Delivery</h4>
                  <p className="text-xs text-slate-500">On orders over $50</p>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Shield size={20} />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">1 Year Warranty</h4>
                  <p className="text-xs text-slate-500">Official guarantee</p>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                    <RotateCcw size={20} />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">30-Day Returns</h4>
                  <p className="text-xs text-slate-500">No questions asked</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
