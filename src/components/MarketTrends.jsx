import React, { useEffect } from "react";
import { marked } from "marked";

function Loader() {
    return (
        <div
            id="trends-loading"
            className="flex-grow flex-col items-center justify-center space-y-4 flex"
        >
            <div className="loader">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
            </div>
            <p className="text-gray-400">Fetching real-time market data...</p>
        </div>
    );
}

function MarketTrends({ isLoading, trends, summary, onFetchTrends, isBusy }) {
    useEffect(() => {
        // Configure marked for nice rendering
        marked.setOptions({
            breaks: true,
            gfm: true,
        });
    }, []);

    return (
        <div
            className="glass-panel p-8 flex flex-col panel-fade-in"
            style={{ animationDelay: "500ms" }}
        >
            <h2 className="text-2xl font-semibold border-b border-white/10 pb-4 text-gray-100">
                বাজার প্রবণতা: বাংলাদেশ এখন কোথায়?
            </h2>

            {/* Conditional Content */}
            {isLoading ? (
                <Loader />
            ) : (
                <div id="trends-content" className="space-y-4 flex-grow">
                    {trends.length === 0 && !summary ? (
                        <p className="text-gray-400">
                            বাংলাদেশে সর্বশেষ সর্বাধিক বিক্রিত পণ্যগুলি পেতে
                            বাটনে ক্লিক করুন।
                        </p>
                    ) : (
                        <>
                            <ul
                                id="market-trends-list"
                                className="space-y-3 prose prose-invert max-w-none text-gray-200"
                            >
                                {trends.map((item, index) => (
                                    <li
                                        key={index}
                                        dangerouslySetInnerHTML={{
                                            __html: marked(item),
                                        }}
                                    />
                                ))}
                            </ul>
                            {summary && (
                                <div
                                    id="trends-summary"
                                    className="prose prose-invert text-sm text-teal-300 italic"
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
                className="mt-6 w-full btn-primary text-white font-bold py-3 px-6 rounded-lg text-base"
                disabled={isLoading || isBusy}
            >
                {isLoading ? "দেখুন..." : "শীর্ষ ৫টি ট্রেন্ড দেখুন।"}
            </button>
        </div>
    );
}

export default MarketTrends;
