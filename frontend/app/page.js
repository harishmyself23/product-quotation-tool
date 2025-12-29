"use client";

import { useState } from "react";
import TabNavigation from "@/components/TabNavigation";
import ProductSearch from "@/components/ProductSearch";
import Cart from "@/components/Cart";
import QuotationForm from "@/components/QuotationForm";
import ProductCatalog from "@/components/ProductCatalog";
import CardGenerationModal from "@/components/CardGenerationModal";
import GeneratedCardsView from "@/components/GeneratedCardsView";
import { generateProductCard } from "@/lib/cardGenerator";

export default function Home() {
    const [activeTab, setActiveTab] = useState("quotation");
    const [cartItems, setCartItems] = useState([]);

    // Product Catalog states
    const [showCardModal, setShowCardModal] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [generatedCards, setGeneratedCards] = useState([]);
    const [showCardsView, setShowCardsView] = useState(false);

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

    const handleGenerateCards = (products) => {
        setSelectedProducts(products);
        setShowCardModal(true);
    };

    const handleGenerateAllCards = async (productData) => {
        setShowCardModal(false);

        // Generate cards
        const cards = [];
        for (const product of productData) {
            const blob = await generateProductCard(
                product,
                product.customPrice,
                product.customDescription
            );
            cards.push({ product, blob });
        }

        setGeneratedCards(cards);
        setShowCardsView(true);
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">Product Quotation Tool</h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tab Navigation */}
                <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

                {/* Quotation Tool Tab */}
                {activeTab === "quotation" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left: Product Search */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Products</h2>
                                <ProductSearch onAddToCart={handleAddToCart} cartItems={cartItems} />
                            </div>
                        </div>

                        {/* Right: Cart + Quotation Form */}
                        <div className="space-y-6">
                            <Cart
                                items={cartItems}
                                onUpdateQuantity={handleUpdateQuantity}
                                onRemoveItem={handleRemoveItem}
                                onUpdatePrice={handleUpdatePrice}
                            />
                            <QuotationForm items={cartItems} />
                        </div>
                    </div>
                )}

                {/* Product Catalog Tab */}
                {activeTab === "catalog" && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Catalog</h2>
                        <ProductCatalog onGenerateCards={handleGenerateCards} />
                    </div>
                )}
            </main>

            {/* Modals */}
            {showCardModal && (
                <CardGenerationModal
                    products={selectedProducts}
                    onGenerate={handleGenerateAllCards}
                    onClose={() => setShowCardModal(false)}
                />
            )}

            {showCardsView && (
                <GeneratedCardsView
                    cards={generatedCards}
                    onClose={() => {
                        setShowCardsView(false);
                        setGeneratedCards([]);
                    }}
                />
            )}
        </div>
    );
}
