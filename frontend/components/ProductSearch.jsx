"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Plus, Loader2, Filter } from "lucide-react";
import { fetchAllProducts } from "@/lib/api";
import { cn, formatImageUrl } from "@/lib/utils";

/**
 * ProductSearch Component
 * Handles searching and displaying products with INSTANT local filtering and category selection
 * 
 * @param {Function} onAddToCart - Callback when product is added
 * @param {Array} cartItems - Current items in cart to check for duplicates
 */
export default function ProductSearch({ onAddToCart, cartItems = [] }) {
    const [query, setQuery] = useState("");
    const [allProducts, setAllProducts] = useState([]); // Stores the full catalog
    const [filteredProducts, setFilteredProducts] = useState([]); // Stores visible results
    const [selectedCategory, setSelectedCategory] = useState("All Products");
    const [categories, setCategories] = useState([]);

    // Loading state for initial fetch
    const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
    const [catalogError, setCatalogError] = useState(null);

    // Initial Data Fetch
    useEffect(() => {
        let mounted = true;

        const loadCatalog = async () => {
            try {
                const result = await fetchAllProducts();
                if (mounted) {
                    if (result.success) {
                        const products = result.data || [];
                        setAllProducts(products);

                        // Extract unique categories
                        const uniqueCategories = [...new Set(
                            products
                                .map(p => p.category?.trim())
                                .filter(cat => cat && cat.length > 0)
                        )].sort();

                        // Build category list with counts
                        const categoryList = uniqueCategories.map(cat => ({
                            name: cat,
                            count: products.filter(p => p.category?.trim() === cat).length
                        })).filter(cat => cat.count > 0); // Hide empty categories

                        // Add "All Products" at the beginning
                        categoryList.unshift({
                            name: "All Products",
                            count: products.length
                        });

                        setCategories(categoryList);

                        // Show first 10 products initially
                        setFilteredProducts(products.slice(0, 10));
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

    // Combined Filtering Effect (Category + Search)
    useEffect(() => {
        const trimmedQuery = query.toLowerCase().trim();

        // Filter by category first
        let categoryFiltered = allProducts;
        if (selectedCategory !== "All Products") {
            categoryFiltered = allProducts.filter(
                product => product.category?.trim() === selectedCategory
            );
        }

        // If no search query, show category results (or first 10 if "All Products" and no search)
        if (!trimmedQuery) {
            if (selectedCategory === "All Products" && query === "") {
                // Initial state: show first 10
                setFilteredProducts(categoryFiltered.slice(0, 10));
            } else {
                // Category selected but no search: show all in category
                setFilteredProducts(categoryFiltered);
            }
            return;
        }

        // Apply search filter within category
        const results = categoryFiltered.filter(product => {
            const matchesName = product.product_name?.toLowerCase().includes(trimmedQuery);
            const matchesId = String(product.product_id).toLowerCase().includes(trimmedQuery);
            const matchesCategory = product.category?.toLowerCase().includes(trimmedQuery);
            return matchesName || matchesId || matchesCategory;
        });

        // Limit results to avoid rendering lag
        setFilteredProducts(results.slice(0, 50));

    }, [query, selectedCategory, allProducts]);

    const handleManualSearch = (e) => {
        e.preventDefault();
    };

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
    };

    // Calculate current count for display
    const currentCount = filteredProducts.length;
    const totalInCategory = selectedCategory === "All Products"
        ? allProducts.length
        : allProducts.filter(p => p.category?.trim() === selectedCategory).length;

    return (
        <div className="w-full space-y-6">
            {/* Search Input + Category Filter */}
            <form onSubmit={handleManualSearch} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={isLoadingCatalog ? "Loading catalog..." : "Type to search (Instant)..."}
                        disabled={isLoadingCatalog}
                        className="w-full h-10 pl-10 pr-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    {isLoadingCatalog && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-500 flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Loading...
                        </div>
                    )}
                </div>

                {/* Category Dropdown */}
                <div className="relative sm:w-64">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                    <select
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        disabled={isLoadingCatalog}
                        className="w-full h-10 pl-10 pr-8 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                    >
                        {categories.map((cat) => (
                            <option key={cat.name} value={cat.name}>
                                {cat.name} ({cat.count})
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </form>

            {/* Results Grid */}
            <div className="space-y-4">
                {catalogError && (
                    <div className="p-4 rounded-md bg-red-50 text-red-600 border border-red-100 text-sm">
                        {catalogError}
                    </div>
                )}

                {/* Product Count Display */}
                {!isLoadingCatalog && !catalogError && filteredProducts.length > 0 && (
                    <div className="text-sm text-gray-600">
                        Showing <span className="font-semibold text-gray-900">{currentCount}</span>
                        {currentCount < totalInCategory && ` of ${totalInCategory}`} products
                        {selectedCategory !== "All Products" && (
                            <span> in <span className="font-semibold text-gray-900">{selectedCategory}</span></span>
                        )}
                    </div>
                )}

                {!isLoadingCatalog && !catalogError && filteredProducts.length === 0 && (query || selectedCategory !== "All Products") && (
                    <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        No products found
                        {query && ` matching "${query}"`}
                        {selectedCategory !== "All Products" && ` in ${selectedCategory}`}
                    </div>
                )}

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredProducts.map((product) => {
                        const isAdded = cartItems.some(item => item.product_id === product.product_id);
                        return (
                            <div
                                key={product.product_id}
                                className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md flex flex-col h-full"
                            >
                                <div className="aspect-square bg-gray-100 relative overflow-hidden shrink-0">
                                    {product.image_url ? (
                                        <img
                                            src={formatImageUrl(product.image_url)}
                                            alt={product.product_name}
                                            loading="lazy"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            No Image
                                        </div>
                                    )}
                                </div>

                                <div className="p-3 sm:p-4 space-y-2 flex flex-col flex-1">
                                    <h3 className="font-medium text-sm sm:text-base text-gray-900 line-clamp-2 leading-tight" title={product.product_name}>
                                        {product.product_name}
                                    </h3>

                                    {product.category && (
                                        <p className="text-[10px] sm:text-xs text-gray-500 bg-gray-100 inline-block px-1.5 py-0.5 rounded">
                                            {product.category}
                                        </p>
                                    )}

                                    <div className="mt-auto pt-2">
                                        <button
                                            onClick={() => onAddToCart(product)}
                                            disabled={isAdded}
                                            className={cn(
                                                "w-full flex items-center justify-center gap-2 h-9 rounded-md text-sm font-medium transition-all active:scale-95",
                                                isAdded
                                                    ? "bg-green-100 text-green-700 cursor-default hover:bg-green-100 active:scale-100"
                                                    : "bg-gray-900 text-white hover:bg-gray-800"
                                            )}
                                        >
                                            {isAdded ? (
                                                <>
                                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                    Added
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="h-4 w-4" />
                                                    Add
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
