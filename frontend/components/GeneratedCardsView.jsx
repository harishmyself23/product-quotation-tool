"use client";

import { Download, Share2 } from "lucide-react";
import { downloadImage, shareToWhatsApp } from "@/lib/cardGenerator";
import { useState } from "react";

/**
 * GeneratedCardsView Component
 * Displays generated cards with download and share options
 * 
 * @param {Array} cards - Array of {product, blob} objects
 * @param {Function} onClose - Callback to close view
 */
export default function GeneratedCardsView({ cards, onClose }) {
    const [isMobile] = useState(() => {
        if (typeof window !== 'undefined') {
            return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        }
        return false;
    });

    const handleDownload = (card) => {
        const filename = `${card.product.product_name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
        downloadImage(card.blob, filename);
    };

    const handleShare = async (card) => {
        const success = await shareToWhatsApp(card.blob, card.product.product_name);
        if (!success) {
            // Fallback to download
            handleDownload(card);
        }
    };

    const handleDownloadAll = () => {
        cards.forEach((card, index) => {
            setTimeout(() => {
                const filename = `${card.product.product_name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
                downloadImage(card.blob, filename);
            }, index * 200); // Stagger downloads to avoid browser blocking
        });
    };

    const handleShareAll = async () => {
        if (navigator.share && navigator.canShare) {
            try {
                // Create File objects for all cards
                const files = cards.map((card, index) =>
                    new File([card.blob], `${card.product.product_name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`, { type: 'image/png' })
                );

                // Check if we can share multiple files
                if (await navigator.canShare({ files })) {
                    await navigator.share({
                        files,
                        title: `${cards.length} Product Cards`
                    });
                } else {
                    // Fallback: download all if sharing multiple files not supported
                    handleDownloadAll();
                }
            } catch (err) {
                console.error('Share failed:', err);
                // Fallback to download
                handleDownloadAll();
            }
        } else {
            // Not supported, download instead
            handleDownloadAll();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Generated Cards ({cards.length})
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Download or share your product cards
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {cards.map((card, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                                {/* Preview */}
                                <div className="aspect-square bg-gray-100 relative">
                                    <img
                                        src={URL.createObjectURL(card.blob)}
                                        alt={card.product.product_name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="p-3 space-y-2">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {card.product.product_name}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDownload(card)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-sm"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download
                                        </button>
                                        {isMobile && (
                                            <button
                                                onClick={() => handleShare(card)}
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                                            >
                                                <Share2 className="w-4 h-4" />
                                                Share
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex justify-between items-center flex-wrap gap-3">
                    <div className="flex gap-3">
                        <button
                            onClick={handleDownloadAll}
                            className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors font-medium"
                        >
                            <Download className="w-4 h-4" />
                            Download All ({cards.length})
                        </button>
                        {isMobile && (
                            <button
                                onClick={handleShareAll}
                                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                            >
                                <Share2 className="w-4 h-4" />
                                Share All ({cards.length})
                            </button>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
