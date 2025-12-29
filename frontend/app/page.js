"use client";

import { useState } from "react";
import ProductSearch from "@/components/ProductSearch";
import Cart from "@/components/Cart";
import QuotationForm from "@/components/QuotationForm";

export default function Home() {
    const [cartItems, setCartItems] = useState([]);

    const handleAddToCart = (product) => {
        setCartItems((prev) => {
            const existing = prev.find((p) => p.product_id === product.product_id);
            if (existing) {
                return prev.map((p) =>
                    p.product_id === product.product_id
                        ? { ...p, quantity: p.quantity + 1 }
                        : p
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const handleUpdateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) return;
        setCartItems((prev) =>
            prev.map((p) =>
                p.product_id === productId ? { ...p, quantity: newQuantity } : p
            )
        );
    };

    const handleUpdatePrice = (productId, newPrice) => {
        setCartItems((prev) =>
            prev.map((p) =>
                p.product_id === productId ? { ...p, price: newPrice } : p
            )
        );
    };

    const handleRemoveItem = (productId) => {
        setCartItems((prev) => prev.filter((p) => p.product_id !== productId));
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                            Q
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                            Quotation<span className="text-blue-600">Builder</span>
                        </h1>
                    </div>
                    <div className="text-sm text-gray-500">
                        Internal Tool v1.1
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Product Search */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Catalog</h2>
                            <ProductSearch onAddToCart={handleAddToCart} cartItems={cartItems} />
                        </div>
                    </div>

                    {/* Right Column: Cart & Form */}
                    <div className="lg:col-span-5 space-y-6 sticky top-24">
                        <Cart
                            items={cartItems}
                            onUpdateQuantity={handleUpdateQuantity}
                            onRemoveItem={handleRemoveItem}
                            onUpdatePrice={handleUpdatePrice}
                        />

                        <QuotationForm items={cartItems} />
                    </div>
                </div>
            </main>
        </div>
    );
}
