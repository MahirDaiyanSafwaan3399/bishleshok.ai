import React from "react";

function JsonOutput({ json }) {
    return (
        <div className="modern-card p-4 sm:p-6 h-64 sm:h-80 md:h-96 flex flex-col fade-in">
            <div className="mb-3 sm:mb-4">
                <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-widest">
                    Raw JSON Details
                </h3>
            </div>
            <pre
                id="json-output"
                className="bg-[#1F3440] p-4 rounded-lg text-xs h-full overflow-y-auto border border-[#25BDB0]/20 font-mono text-[#56D7B4] flex-grow"
            >
                {json}
            </pre>
        </div>
    );
}

export default JsonOutput;