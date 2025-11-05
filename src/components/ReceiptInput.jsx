import React, { useRef, useState } from "react";

// This component receives props (properties) from App.jsx
function ReceiptInput({ isBusy, onFileSelect, onFileDrop }) {
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    // --- Drag and Drop Event Handlers ---
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isBusy) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (isBusy) return;

        // Pass the dropped file up to App.jsx
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            // We call the function passed as a prop
            onFileDrop(e);
        }
    };

    // --- Click to Browse Handler ---
    const handleBrowseClick = () => {
        // Clicks the hidden file input
        fileInputRef.current.click();
    };

    // --- File Input Change Handler ---
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            // We call the function passed as a prop
            onFileSelect(e);
        }
    };

    // Dynamic classes for the drop zone
    const dropZoneClass = `
        border-2 border-dashed border-white/10 rounded-2xl p-8 md:p-12 text-center cursor-pointer 
        transition-all duration-300 ease-in-out
        ${
            isDragging
                ? "border-indigo-400 border-solid bg-indigo-900/20 scale-105"
                : "hover:border-indigo-400 hover:bg-white/5"
        }
    `;

    return (
        <div
            id="receipt-section"
            className="lg:col-span-3 p-8 glass-panel space-y-6 panel-fade-in"
            style={{ animationDelay: "100ms" }}
        >
            <h2 className="text-2xl font-semibold border-b border-white/10 pb-4 text-gray-100">
                Extract from Receipt
            </h2>

            {/* Drag & Drop Zone */}
            <div
                id="drop-zone"
                className={dropZoneClass}
                onClick={handleBrowseClick}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <svg
                    className="mx-auto h-16 w-16 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                </svg>

                <p className="mt-4 text-lg font-medium text-gray-300">
                    Drag & Drop Image/PDF Here
                </p>
                <p className="text-sm text-gray-500 my-2">OR</p>
                <input
                    type="file"
                    id="file-input"
                    ref={fileInputRef}
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isBusy}
                />
                <button
                    type="button"
                    className="mt-4 btn-ghost font-semibold py-2 px-6 rounded-lg"
                    disabled={isBusy}
                >
                    Browse Files
                </button>
            </div>
        </div>
    );
}

export default ReceiptInput;
