import React, { useEffect } from "react";
import { marked } from "marked";

function Loader() {
    return (
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <div className="loader">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
            </div>
            <p className="text-sm text-[#a0b8c5] font-medium">Fetching market data...</p>
        </div>
    );
}

function MarketTrends({ isLoading, trends, summary, onFetchTrends, isBusy }) {
    useEffect(() => {
        marked.setOptions({
            breaks: true,
            gfm: true,
        });
    }, []);

    return (
        <div className="modern-card p-4 sm:p-6 fade-in">
            <div className="mb-3 sm:mb-4">
                <h2 className="text-base sm:text-lg font-bold text-white mb-2 tracking-tight">
                    Market Trends
                </h2>
                <p className="text-xs sm:text-sm text-[#a0b8c5] font-medium leading-relaxed">
                    Top trending products in Bangladesh
                </p>
            </div>

            {isLoading ? (
                <Loader />
            ) : (
                <div className="space-y-4">
                    {trends.length === 0 && !summary ? (
                        <p className="text-sm text-[#a0b8c5] text-center py-8 font-medium">
                            Click the button below to fetch the latest market trends
                        </p>
                    ) : (
                        <>
                            <ul className="space-y-2">
                                {trends.map((item, index) => (
                                    <li
                                        key={index}
                                        className="flex items-start space-x-3 text-sm text-[#a0b8c5] font-normal leading-relaxed"
                                        dangerouslySetInnerHTML={{
                                            __html: marked(item),
                                        }}
                                    />
                                ))}
                            </ul>
                            {summary && (
                                <div
                                    className="mt-4 p-3 bg-[#2C6566]/30 border border-[#25BDB0]/30 rounded-lg text-sm text-[#a0b8c5] font-medium leading-relaxed"
                                    dangerouslySetInnerHTML={{
                                        __html: marked(summary),
                                    }}
                                />
                            )}
                        </>
                    )}
                </div>
            )}

            <button
                id="trends-btn"
                onClick={onFetchTrends}
                className="btn-modern btn-primary w-full mt-6"
                disabled={isLoading || isBusy}
            >
                {isLoading ? "Loading..." : "Fetch Market Trends"}
            </button>
        </div>
    );
}

export default MarketTrends;