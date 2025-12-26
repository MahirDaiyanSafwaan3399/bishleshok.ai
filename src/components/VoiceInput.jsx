import React from "react";

function VoiceInput({
    isBusy,
    isRecording,
    micStatus,
    micReady,
    ttsStatus,
    onStartVoiceInput,
}) {
    const voiceButtonClass = `
        w-full font-medium py-3 px-4 rounded-lg text-sm
        transition-all duration-300
        ${isRecording 
            ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30" 
            : "btn-modern btn-primary"
        }
        ${(isBusy || !micReady) ? "opacity-50 cursor-not-allowed" : ""}
    `;

    return (
        <div className="modern-card p-4 sm:p-6 fade-in h-full flex flex-col">
            <div className="mb-3 sm:mb-4">
                <h2 className="text-base sm:text-lg font-bold text-white mb-2 tracking-tight">
                    Voice Input
                </h2>
                <p className="text-xs sm:text-sm text-[#a0b8c5] font-medium leading-relaxed">
                    Record your data in Bengali
                </p>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-3 sm:space-y-4 py-6 sm:py-8 md:py-12">
                <button
                    id="voice-btn"
                    onClick={onStartVoiceInput}
                    className={voiceButtonClass}
                    disabled={isBusy || !micReady}
                >
                    <span id="voice-btn-text">
                        {isRecording
                            ? "🔴 Recording... Click to stop"
                            : "🎤 Start Voice Input"}
                    </span>
                </button>
                
                <div className="text-center">
                    <p
                        id="mic-status"
                        className={`text-sm font-medium ${
                            micReady
                                ? "text-[#a0b8c5]"
                                : "text-[#6b8a9e]"
                        }`}
                    >
                        {isRecording
                            ? "Speak clearly in Bengali..."
                            : micStatus}
                    </p>
                    {ttsStatus && (
                        <p
                            id="tts-status"
                            className="text-sm text-[#7c3aed] mt-1 font-semibold"
                        >
                            {ttsStatus}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default VoiceInput;