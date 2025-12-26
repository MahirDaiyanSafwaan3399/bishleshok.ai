import React, { useState } from "react";

function DateFilter({ onFilterChange, dataLength }) {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isFiltered, setIsFiltered] = useState(false);

    const handleApplyFilter = () => {
        if (startDate && endDate) {
            onFilterChange({ startDate, endDate });
            setIsFiltered(true);
        }
    };

    const handleClearFilter = () => {
        setStartDate("");
        setEndDate("");
        onFilterChange(null);
        setIsFiltered(false);
    };

    return (
        <div className="modern-card p-3 sm:p-4 md:p-6 fade-in">
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <label className="text-xs sm:text-sm text-[#a0b8c5] font-semibold whitespace-nowrap">
                        From:
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="modern-input w-full sm:w-auto flex-1 sm:flex-none"
                    />
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <label className="text-xs sm:text-sm text-[#a0b8c5] font-semibold whitespace-nowrap">
                        To:
                    </label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="modern-input w-full sm:w-auto flex-1 sm:flex-none"
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                        onClick={handleApplyFilter}
                        disabled={!startDate || !endDate}
                        className="btn-modern btn-primary text-sm sm:text-base flex-1 sm:flex-none"
                    >
                        Apply Filter
                    </button>
                    {isFiltered && (
                        <button
                            onClick={handleClearFilter}
                            className="btn-modern btn-ghost text-sm sm:text-base"
                        >
                            Clear
                        </button>
                    )}
                </div>
                <div className="text-xs sm:text-sm text-[#a0b8c5] font-medium ml-auto sm:ml-0">
                    Total: <span className="font-bold text-white">{dataLength}</span> records
                </div>
            </div>
        </div>
    );
}

export default DateFilter;