import React from "react";

function ActionButtons({ isBusy, hasData, onSave, onClear }) {
    // Disable buttons if busy or no data
    const isDisabled = isBusy || !hasData;

    return (
        <div
            className="lg:col-span-2 flex flex-col space-y-6 panel-fade-in"
            style={{ animationDelay: "900ms" }}
        >
            <button
                id="save-btn"
                onClick={onSave}
                className="w-full btn-primary text-white font-bold py-5 px-6 rounded-lg text-lg"
                disabled={isDisabled}
            >
                💾 সব ডেটা এক্সেল (CSV) ফাইলে সেভ করুন{" "}
                {/* MODIFIED: "Save All to Excel (CSV)" */}
            </button>
            <button
                id="clear-btn"
                onClick={onClear}
                className="w-full btn-danger text-white font-bold py-5 px-6 rounded-lg text-lg"
                disabled={isDisabled}
            >
                🧹 সব ডেটা মুছে ফেলুন {/* MODIFIED: "Clear All Data" */}
            </button>
        </div>
    );
}

export default ActionButtons;
