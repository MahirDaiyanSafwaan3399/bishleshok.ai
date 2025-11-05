import React from "react";

function Loader() {
    return (
        <div id="loading-spinner" className="loader">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
        </div>
    );
}

function StatusArea({ message, isError, isLoading }) {
    const statusClass = `text-xl font-medium ${
        isError ? "text-red-400" : "text-gray-300"
    }`;

    return (
        <div
            id="status-area"
            className="text-center py-5 rounded-2xl glass-panel flex items-center justify-center space-x-4 min-h-[70px] panel-fade-in"
            style={{ animationDelay: "300ms" }}
        >
            {isLoading && <Loader />}
            <p id="main-status" className={statusClass}>
                {message}
            </p>
        </div>
    );
}

export default StatusArea;
