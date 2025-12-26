import React from "react";

function ActionButtons({ isBusy, hasData, onSave, onClear }) {
    const isDisabled = isBusy || !hasData;

    return (
        <div className="flex flex-col space-y-3 fade-in">
            <button
                id="save-btn"
                onClick={onSave}
                className="btn-modern btn-primary w-full"
                disabled={isDisabled}
            >
                💾 Export to CSV
            </button>
            <button
                id="clear-btn"
                onClick={onClear}
                className="btn-modern btn-danger w-full"
                disabled={isDisabled}
            >
                🗑️ Clear All Data
            </button>
        </div>
    );
}

export default ActionButtons;