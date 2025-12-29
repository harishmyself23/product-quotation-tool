"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Plus, Loader2 } from "lucide-react";
import { fetchAllProducts } from "@/lib/api";
import { cn, formatImageUrl } from "@/lib/utils";

/**
 * ProductSearch Component
 * Handles searching and displaying products with INSTANT local filtering
 * 
 * @param {Function} onAddToCart - Callback when product is added
 * @param {Array} cartItems - Current items in cart to check for duplicates
 */
export default function ProductSearch({ onAddToCart, cartItems = [] }) {
    const [query, setQuery] = useState("");
    const [allProducts, setAllProducts] = useState([]); // Stores the full catalog
    const [filteredProducts, setFilteredProducts] = useState([]); // Stores visible results

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
                        setAllProducts(result.data || []);
                        setFilteredProducts([]); // Initially empty until user types? Or show distinct generic recommendations?
                        // Let's show nothing initially or maybe popular ones if we had that logic.
                        // For now, empty is consistent with previous behavior.
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

    // Instant Filtering Effect
    useEffect(() => {
        const trimmedQuery = query.toLowerCase().trim();

        if (!trimmedQuery) {
            setFilteredProducts([]);
            return;
        }

        // Filter valid products locally
        const results = allProducts.filter(product => {
            const matchesName = product.product_name?.toLowerCase().includes(trimmedQuery);
            const matchesId = String(product.product_id).toLowerCase().includes(trimmedQuery);
            const matchesCategory = product.category?.toLowerCase().includes(trimmedQuery);
            return matchesName || matchesId || matchesCategory;
        });

        // Limit results to avoid rendering lag if too many matches (e.g. "a")
        setFilteredProducts(results.slice(0, 50));

    }, [query, allProducts]);

    const handleManualSearch = (e) => {
        e.preventDefault();
    };

    return (
        <div className="w-full space-y-6">
            {/* Search Input */}
            <form onSubmit={handleManualSearch} className="flex gap-2">
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
            </form>

            {/* Results Grid */}
            <div className="space-y-4">
                {catalogError && (
                    <div className="p-4 rounded-md bg-red-50 text-red-600 border border-red-100 text-sm">
                        {catalogError}
                    </div>
                )}

                {!isLoadingCatalog && query && filteredProducts.length === 0 && !catalogError && (
                    <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        No products found matching "{query}"
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
