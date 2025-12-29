"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, Filter } from "lucide-react";
import { fetchAllProducts } from "@/lib/api";
import { cn, formatImageUrl } from "@/lib/utils";

/**
 * ProductCatalog Component
 * Displays all products with multi-select for card generation
 * 
 * @param {Function} onGenerateCards - Callback when "Generate Cards" is clicked
 */
export default function ProductCatalog({ onGenerateCards }) {
    const [query, setQuery] = useState("");
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All Products");
    const [categories, setCategories] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState(new Set());

    const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
    const [catalogError, setCatalogError] = useState(null);

    // Load products
    useEffect(() => {
        let mounted = true;

        const loadCatalog = async () => {
            try {
                const result = await fetchAllProducts();
                if (mounted) {
                    if (result.success) {
                        const products = result.data || [];
                        setAllProducts(products);

                        // Extract categories
                        const uniqueCategories = [...new Set(
                            products
                                .map(p => p.category?.trim())
                                .filter(cat => cat && cat.length > 0)
                        )].sort();

                        const categoryList = uniqueCategories.map(cat => ({
                            name: cat,
                            count: products.filter(p => p.category?.trim() === cat).length
                        })).filter(cat => cat.count > 0);

                        categoryList.unshift({
                            name: "All Products",
                            count: products.length
                        });

                        setCategories(categoryList);
                        setFilteredProducts(products);
                    } else {
                        setCatalogError("Failed to load product catalog. Please refresh.");
                    }
                }
            } catch (err) {
                if (mounted) setCatalogError("Network error loading catalog.");
            } finally {
                if (mounted) setIsLoadingCatalog(false);
            }
        };

        loadCatalog();
        return () => { mounted = false; };
    }, []);

    // Filter products
    useEffect(() => {
        const trimmedQuery = query.toLowerCase().trim();

        let categoryFiltered = allProducts;
        if (selectedCategory !== "All Products") {
            categoryFiltered = allProducts.filter(
                product => product.category?.trim() === selectedCategory
            );
        }

        if (!trimmedQuery) {
            setFilteredProducts(categoryFiltered);
            return;
        }

        const results = categoryFiltered.filter(product => {
            const matchesName = product.product_name?.toLowerCase().includes(trimmedQuery);
            const matchesId = String(product.product_id).toLowerCase().includes(trimmedQuery);
            const matchesCategory = product.category?.toLowerCase().includes(trimmedQuery);
            return matchesName || matchesId || matchesCategory;
        });

        setFilteredProducts(results);
    }, [query, selectedCategory, allProducts]);

    const handleSelectProduct = (productId) => {
        const newSelected = new Set(selectedProducts);
        if (newSelected.has(productId)) {
            newSelected.delete(productId);
        } else {
            newSelected.add(productId);
        }
        setSelectedProducts(newSelected);
    };

    const handleGenerateCards = () => {
        const selected = allProducts.filter(p => selectedProducts.has(p.product_id));
        onGenerateCards(selected);
    };

    return (
        <div className="w-full space-y-6">
            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={isLoadingCatalog ? "Loading catalog..." : "Search products..."}
                        disabled={isLoadingCatalog}
                        className="w-full h-10 pl-10 pr-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    {isLoadingCatalog && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        </div>
                    )}
                </div>

                <div className="relative sm:w-64">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        disabled={isLoadingCatalog}
                        className="w-full h-10 pl-10 pr-8 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                    >
                        {categories.map((cat) => (
                            <option key={cat.name} value={cat.name}>
                                {cat.name} ({cat.count})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Selection Info + Generate Button */}
            <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                    {selectedProducts.size > 0 ? (
                        <span className="font-semibold text-gray-900">{selectedProducts.size} products selected</span>
                    ) : (
                        "Select products to generate cards"
                    )}
                </p>
                <button
                    onClick={handleGenerateCards}
                    disabled={selectedProducts.size === 0}
                    className={cn(
                        "px-4 py-2 rounded-md font-medium transition-all",
                        selectedProducts.size > 0
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    )}
                >
                    Generate Cards
                </button>
            </div>

            {/* Error */}
            {catalogError && (
                <div className="p-4 rounded-md bg-red-50 text-red-600 border border-red-100 text-sm">
                    {catalogError}
                </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {filteredProducts.map((product) => {
                    const isSelected = selectedProducts.has(product.product_id);
                    return (
                        <div
                            key={product.product_id}
                            onClick={() => handleSelectProduct(product.product_id)}
                            className={cn(
                                "relative bg-white border-2 rounded-lg overflow-hidden cursor-pointer transition-all",
                                isSelected
                                    ? "border-blue-500 shadow-md"
                                    : "border-gray-200 hover:border-gray-300"
                            )}
                        >
                            {/* Checkbox */}
                            <div className="absolute top-2 right-2 z-10">
                                <div className={cn(
                                    "w-6 h-6 rounded border-2 flex items-center justify-center transition-all",
                                    isSelected
                                        ? "bg-blue-600 border-blue-600"
                                        : "bg-white border-gray-300"
                                )}>
                                    {isSelected && (
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            </div>

                            {/* Image */}
                            <div className="aspect-square bg-gray-100 relative">
                                {product.image_url ? (
                                    <img
                                        src={formatImageUrl(product.image_url)}
                                        alt={product.product_name}
                                        loading="lazy"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                        No Image
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="p-2 sm:p-3">
                                <h3 className="font-medium text-xs sm:text-sm text-gray-900 line-clamp-2 leading-tight" title={product.product_name}>
                                    {product.product_name}
                                </h3>
                                {product.category && (
                                    <p className="text-[10px] text-gray-500 mt-1">
                                        {product.category}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {!isLoadingCatalog && filteredProducts.length === 0 && (
                <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    No products found
                </div>
            )}
        </div>
    );
}
