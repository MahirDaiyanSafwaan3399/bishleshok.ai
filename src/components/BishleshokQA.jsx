import React, { useState } from "react";

function Loader() {
    return (
        <div id="qa-loader" className="loader flex mx-auto">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
        </div>
    );
}

function BishleshokQA({ isBusy, isLoading, responseHtml, onSubmit, hasData }) {
    // Local state for the textarea
    const [question, setQuestion] = useState("");

    const handleSubmit = () => {
        if (question.trim()) {
            onSubmit(question);
        }
    };

    // Disable button if busy, loading, or no data
    const isButtonDisabled = isBusy || isLoading || !hasData;

    return (
        <div
            className="glass-panel p-8 space-y-6 panel-fade-in"
            style={{ animationDelay: "600ms" }}
        >
            <h2 className="text-2xl font-semibold border-b border-white/10 pb-4 text-gray-100">
                bishleshok.ai
            </h2>
            <p className="text-gray-400">
                "আমার কোন পণ্যটি সবচেয়ে লাভজনক?" or "আগামী সপ্তাহে আমার কী স্টক
                করা উচিত?"
            </p>
            <div className="space-y-4">
                <textarea
                    id="qa-input"
                    className="qa-textarea w-full p-4 rounded-lg h-28"
                    placeholder="আপনার প্রশ্ন এখানে লিখুন..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    disabled={isButtonDisabled}
                />
                <button
                    id="qa-submit-btn"
                    onClick={handleSubmit}
                    className="w-full btn-primary text-white font-bold py-4 px-6 rounded-lg text-lg"
                    disabled={isButtonDisabled}
                >
                    {isLoading
                        ? "Analyzing..."
                        : "bishleshok.ai কে জিজ্ঞেস করুন"}
                </button>
            </div>
            <div className="mt-6 min-h-[100px]">
                {isLoading ? (
                    <Loader />
                ) : (
                    <div
                        id="qa-response-area"
                        className="p-4 bg-black/30 rounded-lg"
                        // This is how you render HTML from a string in React
                        dangerouslySetInnerHTML={{ __html: responseHtml }}
                    />
                )}
            </div>
        </div>
    );
}

export default BishleshokQA;
