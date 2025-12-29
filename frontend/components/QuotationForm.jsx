"use client";

import { useState, useEffect } from "react";
import { FileText, Loader2, Download } from "lucide-react";
import { generateQuotation } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * QuotationForm Component
 * Collects customer details and triggers generation
 * 
 * @param {Array} items - Selected products
 * @param {Function} onGenerate - Callback for API call (optional wrapper)
 */
export default function QuotationForm({ items }) {
    const [formData, setFormData] = useState({
        customer_name: "",
        quotation_number: `Q-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
        quotation_date: new Date().toISOString().split('T')[0]
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [downloadUrl, setDownloadUrl] = useState(null);

    // Reset download URL when items change to prevent stale downloads
    useEffect(() => {
        setDownloadUrl(null);
    }, [items]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (items.length === 0) return;

        setLoading(true);
        setError(null);
        setDownloadUrl(null);

        const payload = {
            ...formData,
            selected_products: items.map(item => ({
                product_id: item.product_id,
                name: item.product_name,
                price: item.price,
                quantity: item.quantity,
                image_url: item.image_url
            }))
        };

        try {
            const result = await generateQuotation(payload);

            if (result.success) {
                setDownloadUrl(result.data.downloadUrl);
            } else {
                setError(result.error || "Failed to generate quotation");
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = formData.customer_name && formData.quotation_number && items.length > 0;

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                <FileText className="w-5 h-5 text-gray-500" />
                <h2 className="font-semibold text-gray-900">Quotation Details</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Customer Name</label>
                    <input
                        type="text"
                        required
                        value={formData.customer_name}
                        onChange={(e) => {
                            setFormData(d => ({ ...d, customer_name: e.target.value }));
                            setDownloadUrl(null); // Reset when details change too
                        }}
                        placeholder="Enter customer name"
                        className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Date</label>
                        <input
                            type="date"
                            required
                            value={formData.quotation_date}
                            onChange={(e) => {
                                setFormData(d => ({ ...d, quotation_date: e.target.value }));
                                setDownloadUrl(null);
                            }}
                            className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Quotation #</label>
                        <input
                            type="text"
                            required
                            value={formData.quotation_number}
                            onChange={(e) => {
                                setFormData(d => ({ ...d, quotation_number: e.target.value }));
                                setDownloadUrl(null);
                            }}
                            className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-3 text-sm rounded bg-red-50 text-red-600 border border-red-100">
                        {error}
                    </div>
                )}

                <div className="space-y-3">
                    {downloadUrl && (
                        <a
                            href={downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full h-11 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm transition-colors animate-in fade-in slide-in-from-top-2"
                        >
                            <Download className="w-4 h-4" />
                            Download Quotation
                        </a>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !isFormValid}
                        className={cn(
                            "w-full h-11 flex items-center justify-center gap-2 font-medium rounded-lg transition-all shadow-sm",
                            downloadUrl
                                ? "bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                                : "bg-gray-900 text-white hover:bg-gray-800",
                            (loading || !isFormValid) && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            downloadUrl ? "Regenerate Quotation" : "Generate Quotation"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
