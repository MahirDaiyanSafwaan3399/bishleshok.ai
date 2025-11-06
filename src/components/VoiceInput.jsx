import React from "react";

function VoiceInput({
    isBusy,
    isRecording,
    micStatus,
    micReady,
    ttsStatus,
    onStartVoiceInput,
}) {
    // Dynamic classes for the voice button
    const voiceButtonClass = `
        w-full text-white font-bold py-4 px-6 rounded-lg text-lg
        ${isRecording ? "bg-red-600 voice-active" : "btn-primary"}
    `;

    return (
        <div
            id="voice-section"
            className="lg:col-span-2 p-8 glass-panel space-y-6 flex flex-col justify-between panel-fade-in"
            style={{ animationDelay: "200ms" }}
        >
            <div>
                <h2 className="text-2xl font-semibold border-b border-white/10 pb-4 text-gray-100">
                    ভয়েস থেকে তথ্য নিন {/* MODIFIED: "Extract from Voice" */}
                </h2>
                <p className="text-base text-gray-400 mt-4 leading-relaxed">
                    <br />
                    বাটনে ক্লিক করুন এবং আপনার ডেটা বাংলায় বলুন।
                    <br />
                    (যেমন, "পণ্য: 'এ', মূল্য: '১০০', ব্যবহারকারী: 'বি', ...")
                </p>
            </div>

            <div className="space-y-4 pt-4">
                <button
                    id="voice-btn"
                    onClick={onStartVoiceInput}
                    className={voiceButtonClass}
                    // Disable if busy with another task OR if mic isn't ready
                    disabled={isBusy || !micReady}
                    style={isRecording ? { backgroundImage: "none" } : {}}
                >
                    <span id="voice-btn-text">
                        {
                            isRecording
                                ? "🔴 শুনছি..." /* MODIFIED: "Listening..." */
                                : "🗣️ বাংলায় বলা শুরু করুন" /* MODIFIED: "Start Bangla Voice Input" */
                        }
                    </span>
                </button>
                <div
                    id="mic-status"
                    className="text-center text-sm text-gray-400 pt-2"
                >
                    {isRecording
                        ? "পরিষ্কার করে বাংলায় বলুন।" /* MODIFIED: "Speak clearly in Bengali." */
                        : micStatus}
                </div>
                {/* Only show TTS status if there is a message */}
                {ttsStatus && (
                    <div
                        id="tts-status"
                        className="text-center text-sm text-sky-300 pt-2"
                    >
                        {ttsStatus}
                    </div>
                )}
            </div>
        </div>
    );
}

export default VoiceInput;
