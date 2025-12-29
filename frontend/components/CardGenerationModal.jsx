"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * CardGenerationModal Component
 * Form for editing price and description for selected products
 * 
 * @param {Array} products - Selected products
 * @param {Function} onGenerate - Callback with edited product data
 * @param {Function} onClose - Callback to close modal
 */
export default function CardGenerationModal({ products, onGenerate, onClose }) {
    const [productData, setProductData] = useState(
        products.map(p => ({
            ...p,
            customPrice: "",
            customDescription: ""
        }))
    );

    const handlePriceChange = (index, value) => {
        const updated = [...productData];
        updated[index].customPrice = value;
        setProductData(updated);
    };

    const handleDescriptionChange = (index, value) => {
        if (value.length <= 200) {
            const updated = [...productData];
            updated[index].customDescription = value;
            setProductData(updated);
        }
    };

    const handleGenerate = () => {
        onGenerate(productData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Customize Product Cards
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Product Forms */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {productData.map((product, index) => (
                        <div key={product.product_id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                            <h3 className="font-medium text-gray-900">{product.product_name}</h3>

                            {/* Price Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price (Optional)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                    <input
                                        type="text"
                                        value={product.customPrice}
                                        onChange={(e) => handlePriceChange(index, e.target.value)}
                                        placeholder="Enter price"
                                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Description Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description (Optional)
                                    <span className="text-gray-400 text-xs ml-2">
                                        {product.customDescription.length}/200
                                    </span>
                                </label>
                                <textarea
                                    value={product.customDescription}
                                    onChange={(e) => handleDescriptionChange(index, e.target.value)}
                                    placeholder="Add product description..."
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleGenerate}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                    >
                        Generate All Cards
                    </button>
                </div>
            </div>
        </div>
    );
}
