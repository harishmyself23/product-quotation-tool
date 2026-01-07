"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Loader2, UploadCloud, CheckCircle, XCircle, FileImage, Trash2, Play, AlertCircle } from "lucide-react";
import confetti from "canvas-confetti";
import { fetchAllProducts, checkNameUniqueness, addProduct, uploadToImgBB } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * BulkUploadForm Component
 * Allows users to upload multiple files, selecting a single category for all.
 * Processes files sequentially with validations.
 * 
 * @param {Function} onProductAdded - Callback when at least one product is added (to refresh catalog)
 */
export default function BulkUploadForm({ onProductAdded }) {
    // Category State
    const [category, setCategory] = useState("");
    const [categories, setCategories] = useState([]);
    const [isNewCategory, setIsNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");

    // File State
    const [files, setFiles] = useState([]);
    const [processedCount, setProcessedCount] = useState(0);
    const [results, setResults] = useState(null); // { added: [], skipped: [], errors: [] }

    // UI State
    const [isUploading, setIsUploading] = useState(false);
    const [categoryError, setCategoryError] = useState(null);
    const stopRef = useRef(false);

    // Fetch Categories on Mount
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await fetchAllProducts();
                if (res.success) {
                    const uniqueCategories = [...new Set(res.data.map(p => p.category))].sort();
                    setCategories(uniqueCategories);
                }
            } catch (err) {
                console.error("Error fetching categories:", err);
            }
        };
        loadCategories();
    }, []);

    // Handle File Selection
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files).map(file => ({
                file,
                id: Math.random().toString(36).substr(2, 9),
                preview: URL.createObjectURL(file),
                derivedName: file.name.replace(/\.[^/.]+$/, "").toUpperCase(), // simple name derivation
                status: 'pending', // pending, processing, success, skipped, error
                message: ''
            }));
            setFiles(prev => [...prev, ...newFiles]);
        }
    };

    // Remove File
    const removeFile = (id) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    // Clear Queue
    const handleClearQueue = () => {
        setFiles([]);
        setProcessedCount(0);
        setResults(null);
    };

    // Image Processing Helper (Canvas)
    const convertToJpeg = (file) => {
        return new Promise((resolve, reject) => {
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
            img.onerror = reject;
        });
    };

    // Main Upload Processor
    const handleStartUpload = async () => {
        // 1. Validate Category
        const finalCategory = isNewCategory ? newCategoryName.trim() : category;
        if (!finalCategory) {
            setCategoryError("Please select or create a category first.");
            return;
        }
        setCategoryError(null);

        // 2. Start Processing
        setIsUploading(true);
        stopRef.current = false;
        setProcessedCount(0);
        const finalResults = { added: 0, skipped: 0, errors: 0 };

        // Process sequentially
        for (let i = 0; i < files.length; i++) {
            if (stopRef.current) break; // STOP SIGNAL check

            const currentFileObj = files[i];

            // Update status to processing
            setFiles(prev => prev.map(f => f.id === currentFileObj.id ? { ...f, status: 'processing' } : f));
            setProcessedCount(i + 1);

            try {
                // Check name uniqueness first
                const nameCheck = await checkNameUniqueness(currentFileObj.derivedName);
                if (!nameCheck.success) throw new Error("Validation check failed");
                if (!nameCheck.data.isUnique) {
                    // SKIP
                    setFiles(prev => prev.map(f => f.id === currentFileObj.id ? { ...f, status: 'skipped', message: 'Duplicate name' } : f));
                    finalResults.skipped++;
                    continue; // Skip rest of loop for this file
                }

                // Process Image
                const jpegBlob = await convertToJpeg(currentFileObj.file);

                // Upload to ImgBB
                const uploadRes = await uploadToImgBB(jpegBlob, `${currentFileObj.derivedName.toLowerCase()}.jpg`);
                if (!uploadRes.success) throw new Error(uploadRes.error || "ImgBB upload failed");

                // Add to Sheet
                const addRes = await addProduct({
                    name: currentFileObj.derivedName,
                    category: finalCategory,
                    image_url: uploadRes.url
                });

                if (addRes.success) {
                    setFiles(prev => prev.map(f => f.id === currentFileObj.id ? { ...f, status: 'success' } : f));
                    finalResults.added++;
                } else {
                    throw new Error(addRes.error || "Sheet update failed");
                }

            } catch (err) {
                console.error(`Error processing ${currentFileObj.derivedName}:`, err);
                setFiles(prev => prev.map(f => f.id === currentFileObj.id ? { ...f, status: 'error', message: err.message } : f));
                finalResults.errors++;
            }

            // Artificial Delay for stability
            await new Promise(r => setTimeout(r, 1000));
        }

        setIsUploading(false);
        setResults(finalResults);

        if (finalResults.added > 0) {
            confetti({
                particleCount: 200,
                spread: 100,
                origin: { y: 0.6 }
            });
            if (onProductAdded) onProductAdded(); // Trigger Catalog Refresh
        }
    };

    const handleStop = () => {
        stopRef.current = true;
    };

    // Calculate Summary
    const pendingCount = files.filter(f => f.status === 'pending').length;
    const progressPercent = files.length > 0 ? (processedCount / files.length) * 100 : 0;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <UploadCloud className="w-8 h-8 text-blue-600" />
                        Bulk Product Upload
                    </h2>
                    <p className="text-gray-500 mt-2">
                        Add multiple products at once. Files will be named automatically based on their filename.
                    </p>
                </div>
                {!isUploading && results && (
                    <div className="text-right">
                        <p className="text-sm font-bold text-gray-900 mb-1">Last Batch Result:</p>
                        <div className="flex gap-3 text-xs font-semibold">
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">Added: {results.added}</span>
                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">Skipped: {results.skipped}</span>
                            {results.errors > 0 && <span className="bg-red-100 text-red-700 px-2 py-1 rounded">Errors: {results.errors}</span>}
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel: Settings & Upload */}
                <div className="space-y-6">
                    {/* Category Selection */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-gray-700">Category for Batch</label>
                            <button
                                type="button"
                                onClick={() => setIsNewCategory(!isNewCategory)}
                                disabled={isUploading}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase"
                            >
                                {isNewCategory ? "Cancel" : "+ New"}
                            </button>
                        </div>

                        {isNewCategory ? (
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                disabled={isUploading}
                                className="w-full px-4 py-3 rounded-lg border-2 border-gray-100 focus:border-blue-500 outline-none"
                                placeholder="New Category Name"
                            />
                        ) : (
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                disabled={isUploading}
                                className="w-full px-4 py-3 rounded-lg border-2 border-gray-100 focus:border-blue-500 outline-none bg-white cursor-pointer"
                            >
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        )}
                        {categoryError && <p className="text-xs text-red-500 font-medium">{categoryError}</p>}
                    </div>

                    {/* Drop Zone */}
                    <div className="relative">
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={isUploading}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                        />
                        <div className={cn(
                            "border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-all bg-gray-50",
                            isUploading ? "opacity-50 cursor-not-allowed border-gray-200" : "hover:bg-blue-50 hover:border-blue-300 border-gray-300"
                        )}>
                            <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
                            <h3 className="font-bold text-gray-700">Click to Select Images</h3>
                            <p className="text-xs text-gray-500 mt-1">or drag and drop multiple files here</p>
                        </div>
                    </div>

                    {/* Action Button */}
                    {!isUploading && results ? (
                        <button
                            onClick={handleClearQueue}
                            className="w-full py-4 rounded-xl font-bold text-lg bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <Trash2 className="w-5 h-5" />
                            Clear Queue & Upload More
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            {isUploading && (
                                <button
                                    onClick={handleStop}
                                    className="px-4 rounded-xl font-bold bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors"
                                    title="Stop Remaining Uploads"
                                >
                                    Stop
                                </button>
                            )}
                            <button
                                onClick={handleStartUpload}
                                disabled={isUploading || files.length === 0}
                                className={cn(
                                    "flex-1 py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
                                    isUploading || files.length === 0
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
                                )}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing {processedCount}/{files.length}...
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-5 h-5 fill-current" />
                                        Start Upload ({files.length})
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Panel: File List */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-[600px]">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center rounded-t-xl">
                        <h3 className="font-semibold text-gray-900">Upload Queue</h3>
                        <span className="text-xs font-medium text-gray-500">{files.length} files</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {files.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <FileImage className="w-12 h-12 mb-3 opacity-20" />
                                <p className="text-sm">No files selected</p>
                            </div>
                        ) : (
                            files.map((file) => (
                                <div key={file.id} className="flex items-center gap-4 p-3 bg-white border border-gray-100 rounded-lg hover:shadow-sm transition-shadow group">
                                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                                        <img src={file.preview} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-xs text-gray-700 truncate" title={file.derivedName}>
                                            {file.derivedName}
                                        </p>
                                        <p className="text-[10px] text-gray-400 truncate">{file.file.name}</p>

                                        {/* Status Message */}
                                        {file.status === 'skipped' && <p className="text-[10px] text-orange-600 font-medium">Skipped: Duplicate Name</p>}
                                        {file.status === 'error' && <p className="text-[10px] text-red-600 font-medium">{file.message}</p>}
                                    </div>

                                    <div className="shrink-0">
                                        {file.status === 'pending' && <button onClick={() => removeFile(file.id)} className="p-2 text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>}
                                        {file.status === 'processing' && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
                                        {file.status === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                                        {file.status === 'skipped' && <AlertCircle className="w-5 h-5 text-orange-400" />}
                                        {file.status === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Progress Bar Footer */}
                    {files.length > 0 && (
                        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-blue-600 h-full transition-all duration-300 ease-out"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
