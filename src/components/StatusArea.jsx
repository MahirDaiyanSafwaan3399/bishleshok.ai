import React from "react";

function Loader() {
    return (
        <div className="loader">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
        </div>
    );
}

function StatusArea({ message, isError, isLoading }) {
    return (
        <div className="modern-card p-4 fade-in">
            <div className="flex items-center justify-center space-x-3">
                {isLoading && <Loader />}
                <p
                    className={`text-base font-semibold ${
                        isError ? "text-red-400" : "text-[#a0b8c5]"
                    } tracking-tight`}
                >
                    {message}
                </p>
            </div>
        </div>
    );
}

export default StatusArea;