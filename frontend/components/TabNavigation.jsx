"use client";

import { cn } from "@/lib/utils";

/**
 * TabNavigation Component
 * Provides tab switching between Quotation Tool and Product Catalog
 * 
 * @param {string} activeTab - Current active tab
 * @param {Function} onTabChange - Callback when tab is clicked
 */
export default function TabNavigation({ activeTab, onTabChange }) {
    const tabs = [
        { id: "quotation", label: "Quotation Tool" },
        { id: "catalog", label: "Product Catalog" },
        { id: "add-product", label: "Add Product" },
        { id: "bulk-upload", label: "Bulk Upload" }
    ];

    return (
        <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={cn(
                            "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                            activeTab === tab.id
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>
    );
}
