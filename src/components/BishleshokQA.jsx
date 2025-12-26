import React, { useState } from "react";

function Loader() {
    return (
        <div className="loader flex mx-auto">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
        </div>
    );
}

function BishleshokQA({ isBusy, isLoading, responseHtml, onSubmit, hasData }) {
    const [question, setQuestion] = useState("");

    const handleSubmit = () => {
        if (question.trim()) {
            onSubmit(question);
        }
    };

    const isButtonDisabled = isBusy || isLoading || !hasData;

    return (
        <div className="modern-card p-4 sm:p-6 fade-in">
            <div className="mb-4">
                <h2 className="text-base sm:text-lg font-bold text-white mb-2 tracking-tight">
                    AI Assistant
                </h2>
                <p className="text-xs sm:text-sm text-[#a0b8c5] font-medium leading-relaxed">
                    Ask questions about your business data
                </p>
            </div>

            <div className="space-y-3 sm:space-y-4">
                <textarea
                    id="qa-input"
                    className="modern-textarea h-20 sm:h-24"
                    placeholder="Ask a question about your data..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    disabled={isButtonDisabled}
                />
                <button
                    id="qa-submit-btn"
                    onClick={handleSubmit}
                    className="btn-modern btn-primary w-full text-sm sm:text-base"
                    disabled={isButtonDisabled}
                >
                    {isLoading ? "Analyzing..." : "Ask Question"}
                </button>
            </div>

            <div className="mt-4 sm:mt-6 min-h-[100px]">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader />
                    </div>
                ) : (
                    <div
                        id="qa-response-area"
                        className="ai-response-content p-6 bg-[#1a1625] rounded-lg border border-[#7c3aed]/20"
                        dangerouslySetInnerHTML={{ __html: responseHtml }}
                    />
                )}
            </div>
        </div>
    );
}

export default BishleshokQA;