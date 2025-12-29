"use client";

import { Trash2, ShoppingCart } from "lucide-react";
import { cn, formatImageUrl } from "@/lib/utils";

/**
 * Cart Component
 * Displays selected products and calculates totals
 * 
 * @param {Array} items - Array of selected products
 * @param {Function} onUpdateQuantity - Callback for quantity updates
 * @param {Function} onRemoveItem - Callback for item removal
 * @param {Function} onUpdatePrice - Callback for price updates
 */
export default function Cart({ items, onUpdateQuantity, onRemoveItem, onUpdatePrice }) {

    if (items.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center space-y-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                    <ShoppingCart className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-gray-900 font-medium">Your quotation is empty</h3>
                    <p className="text-sm text-gray-500">Search for products to add them here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col h-full max-h-[600px]">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Selected Products
                    <span className="text-xs font-normal text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                        {items.length}
                    </span>
                </h2>
            </div>

            <div className="overflow-y-auto p-4 space-y-4 flex-1">
                {items.map((item, index) => (
                    <div key={`${item.product_id}-${index}`} className="flex gap-4 p-3 rounded-lg border border-gray-100 bg-gray-50/30 hover:bg-gray-50 transition-colors group">
                        <div className="w-16 h-16 bg-white rounded-md border border-gray-200 shrink-0 overflow-hidden relative">
                            {item.image_url ? (
                                <img
                                    src={formatImageUrl(item.image_url)}
                                    alt={item.product_name}
                                    loading="lazy"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">img</div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex justify-between items-start gap-2">
                                <h4 className="text-sm font-medium text-gray-900 truncate" title={item.product_name}>
                                    {item.product_name}
                                </h4>
                                <button
                                    onClick={() => onRemoveItem(item.product_id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors p-1 -mr-1"
                                    title="Remove item"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex items-center border border-gray-200 rounded bg-white shadow-sm w-fit">
                                <button
                                    className="px-2 py-0.5 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                >
                                    -
                                </button>
                                <span className="w-8 text-center text-sm font-medium text-gray-700 border-x border-gray-200">
                                    {item.quantity}
                                </span>
                                <button
                                    className="px-2 py-0.5 text-gray-500 hover:bg-gray-50"
                                    onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
