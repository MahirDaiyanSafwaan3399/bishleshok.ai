import React from "react";

function JsonOutput({ json }) {
    return (
        <div
            className="lg:col-span-3 glass-panel p-8 h-96 flex flex-col panel-fade-in"
            style={{ animationDelay: "800ms" }}
        >
            <p className="text-sm font-semibold mb-4 text-gray-400 uppercase tracking-wider">
                Raw JSON Details
            </p>
            <pre
                id="json-output"
                className="bg-black/50 p-6 rounded-lg text-xs h-full overflow-y-auto scroll-hidden code-text flex-grow"
            >
                {json}
            </pre>
        </div>
    );
}

export default JsonOutput;
