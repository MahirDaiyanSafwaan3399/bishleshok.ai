import React, { useRef, useState } from "react";

function ReceiptInput({ isBusy, onFileSelect, onFileDrop }) {
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

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

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileDrop(e);
        }
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e);
        }
    };

    const dropZoneClass = `
        border-2 border-dashed rounded-xl p-8 md:p-12 text-center cursor-pointer 
        transition-all duration-300
        ${
            isDragging
                ? "border-[#7c3aed] bg-[#7c3aed]/10 shadow-lg shadow-[#7c3aed]/20"
                : "border-[#4c1d95] bg-[#1e1b2e] hover:border-[#7c3aed] hover:bg-[#7c3aed]/5"
        }
        ${isBusy ? "opacity-50 cursor-not-allowed" : ""}
    `;

    return (
        <div className="modern-card p-4 sm:p-6 fade-in h-full flex flex-col">
            <div className="mb-3 sm:mb-4">
                <h2 className="text-base sm:text-lg font-bold text-white mb-2 tracking-tight">
                    Upload Receipt
                </h2>
                <p className="text-xs sm:text-sm text-[#a0b8c5] font-medium leading-relaxed">
                    Upload an image or PDF file
                </p>
            </div>

            <div
                className={`${dropZoneClass} flex-1 flex flex-col items-center justify-center`}
                onClick={handleBrowseClick}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <svg
                    className="mx-auto h-12 w-12 text-[#7c3aed] mb-4"
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

                <p className="text-sm font-semibold text-white mb-2 tracking-tight">
                    Drop your file here or click to browse
                </p>
                <p className="text-xs text-[#a0b8c5] font-medium">
                    Supports JPG, PNG, and PDF formats
                </p>
                <input
                    type="file"
                    id="file-input"
                    ref={fileInputRef}
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isBusy}
                />
            </div>
        </div>
    );
}

export default ReceiptInput;