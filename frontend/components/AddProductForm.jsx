"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Loader2, Image as ImageIcon, CheckCircle, XCircle } from "lucide-react";
import confetti from "canvas-confetti";
import { fetchAllProducts, checkNameUniqueness, addProduct, uploadToImgBB } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * AddProductForm Component
 * Handles adding new products with validation and ImgBB hosting
 * 
 * @param {Function} onProductAdded - Success callback
 */
export default function AddProductForm({ onProductAdded }) {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [categories, setCategories] = useState([]); // Local category state
    const [isNewCategory, setIsNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const [nameStatus, setNameStatus] = useState("idle"); // idle, checking, unique, duplicate, invalid, error
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const nameTimeoutRef = useRef(null);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await fetchAllProducts();
                if (res.success) {
                    // Extract unique categories
                    const uniqueCategories = [...new Set(res.data.map(product => product.category))];
                    setCategories(uniqueCategories.sort()); // Sort alphabetically
                } else {
                    console.error("Failed to fetch categories:", res.error);
                    setError("Failed to load categories.");
                }
            } catch (err) {
                console.error("Error fetching categories:", err);
                setError("An error occurred while loading categories.");
            }
        };
        loadCategories();
    }, []);

    // Validation: Auto-CAPS and 35 char limit
    const handleNameChange = (e) => {
        const val = e.target.value.toUpperCase().slice(0, 35);
        setName(val);

        // Reset uniqueness check
        setNameStatus("idle");
        if (nameTimeoutRef.current) clearTimeout(nameTimeoutRef.current);

        if (val.trim().length > 0) {
            // Check for numeric only
            if (/^\d+$/.test(val.trim())) {
                setNameStatus("invalid");
                return;
            }

            setNameStatus("checking");
            nameTimeoutRef.current = setTimeout(async () => {
                const res = await checkNameUniqueness(val.trim());
                if (res.success) {
                    setNameStatus(res.data.isUnique ? "unique" : "duplicate");
                } else {
                    setNameStatus("error");
                }
            }, 600);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const convertToJpeg = (file) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, "image/jpeg", 0.9);
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (nameStatus !== "unique") return;

        setLoading(true);
        setError(null);

        try {
            // 1. Process Image
            let imageUrl = "";
            if (image) {
                const jpegBlob = await convertToJpeg(image);
                const uploadRes = await uploadToImgBB(jpegBlob, `${name.trim().toLowerCase()}.jpg`);
                if (!uploadRes.success) throw new Error(uploadRes.error);
                imageUrl = uploadRes.url;
            }

            // 2. Prepare Data
            const finalCategory = isNewCategory ? newCategoryName : category;

            // 3. Add Product to Sheet
            const res = await addProduct({
                name: name.trim(),
                category: finalCategory,
                image_url: imageUrl
            });

            if (res.success) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#2563EB', '#3B82F6', '#60A5FA', '#FFFFFF']
                });
                setSuccess(true);
                // Reset form
                setName("");
                setCategory("");
                setImage(null);
                setPreviewUrl(null);
                setIsNewCategory(false);
                setNewCategoryName("");
                setNameStatus("idle");

                if (onProductAdded) onProductAdded(res.data);

                setTimeout(() => setSuccess(false), 3000);
            } else {
                setError(res.error);
            }
        } catch (err) {
            console.error('Submission error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-blue-50 rounded-lg">
                    <Plus className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
                    <p className="text-sm text-gray-500">Add to catalog and Sheet</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Name */}
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <label className="text-sm font-semibold text-gray-700">Product Name</label>
                        <span className={cn("text-xs", name.length > 30 ? "text-orange-500" : "text-gray-400")}>
                            {name.length}/35
                        </span>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            value={name}
                            onChange={handleNameChange}
                            className={cn(
                                "w-full px-4 py-3.5 rounded-xl border-2 transition-all outline-none uppercase font-medium",
                                nameStatus === "duplicate" || nameStatus === "invalid"
                                    ? "border-red-100 bg-red-50 text-red-900 focus:border-red-300"
                                    : nameStatus === "unique"
                                        ? "border-green-100 bg-green-50 text-green-900 focus:border-green-300"
                                        : "border-gray-100 bg-gray-50 focus:border-blue-400 focus:bg-white"
                            )}
                            placeholder="E.G. BRASS BALL VALVE"
                            required
                        />
                        <div className="absolute right-4 top-4">
                            {nameStatus === "checking" && <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
                            {nameStatus === "unique" && <CheckCircle className="w-5 h-5 text-green-500" />}
                            {nameStatus === "duplicate" && <XCircle className="w-5 h-5 text-red-500" />}
                            {nameStatus === "invalid" && <XCircle className="w-5 h-5 text-red-500" />}
                            {nameStatus === "error" && <XCircle className="w-5 h-5 text-orange-500" />}
                        </div>
                    </div>
                    {nameStatus === "duplicate" && <p className="text-xs text-red-500 font-medium">This product name already exists in the catalog</p>}
                    {nameStatus === "invalid" && <p className="text-xs text-red-500 font-medium">Product name cannot be numeric only</p>}
                    {nameStatus === "error" && <p className="text-xs text-orange-600 font-medium">Error checking name. Ensure you have Re-Deployed the Apps Script.</p>}
                </div>

                {/* Category Selection */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-gray-700">Category</label>
                        <button
                            type="button"
                            onClick={() => setIsNewCategory(!isNewCategory)}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-tighter"
                        >
                            {isNewCategory ? "← Cancel" : "+ New Category"}
                        </button>
                    </div>

                    {isNewCategory ? (
                        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-100 bg-gray-50 focus:border-blue-400 focus:bg-white outline-none transition-all"
                                placeholder="Enter new category name"
                                autoFocus
                                required
                            />
                        </div>
                    ) : (
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-100 bg-gray-50 focus:border-blue-400 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Image Upload Area */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Product Image</label>
                    <div className="flex gap-5 items-center">
                        <div className="relative">
                            {previewUrl ? (
                                <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-blue-100 relative group">
                                    <img src={previewUrl} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                        <p className="text-[10px] text-white font-bold uppercase">Change</p>
                                    </div>
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleImageChange} />
                                </div>
                            ) : (
                                <label className="w-28 h-28 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-400 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 transition-all cursor-pointer">
                                    <ImageIcon className="w-8 h-8 mb-1" />
                                    <span className="text-[9px] font-bold uppercase tracking-widest">Upload</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            )}
                        </div>
                        <div className="flex-1 space-y-1">
                            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-tight">Image Auto-Process</h4>
                            <ul className="text-[11px] text-gray-500 space-y-0.5 font-medium">
                                <li>✨ Renovated to high-quality JPEG</li>
                                <li>📦 Renamed to product name for SEO</li>
                                <li>☁️ Hosted permanently on ImgBB</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium animate-in zoom-in duration-200">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="p-4 bg-green-50 border border-green-100 text-green-700 rounded-xl text-sm font-bold flex items-center gap-2 animate-in zoom-in duration-200">
                        <CheckCircle className="w-5 h-5" />
                        PRODUCT SAVED TO CATALOG!
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || nameStatus !== "unique"}
                    className={cn(
                        "w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 active:scale-[0.98]",
                        nameStatus === "unique"
                            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    )}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            PROCESSING...
                        </>
                    ) : (
                        "SAVE PRODUCT"
                    )}
                </button>
            </form>
        </div>
    );
}
