import React, { useState, useEffect, useRef, useCallback } from "react";

// --- Firebase Imports ---
import {
    addDoc,
    query,
    onSnapshot,
    getDocs,
    deleteDoc,
} from "firebase/firestore";
import { signInUser, getDataCollectionRef } from "./firebase/config";

// --- Library Imports ---
import { marked } from "marked";

// --- Component Imports ---
import Header from "./components/Header";
import ReceiptInput from "./components/ReceiptInput";
import VoiceInput from "./components/VoiceInput";
import StatusArea from "./components/StatusArea";
import Dashboard from "./components/Dashboard";
import MarketTrends from "./components/MarketTrends";
import BishleshokQA from "./components/BishleshokQA";
import DataTable from "./components/DataTable";
import JsonOutput from "./components/JsonOutput";
import ActionButtons from "./components/ActionButtons";
import Footer from "./components/Footer";
import KPICards from "./components/KPICards";
import PredictiveAnalytics from "./components/PredictiveAnalytics";
import DateFilter from "./components/DateFilter";

// --- Constants (from original script) ---
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL_FLASH = "gemini-2.5-flash-preview-09-2025";
const MODEL_TTS = "gemini-2.5-flash-preview-tts";
const API_URL_CONTENT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_FLASH}:generateContent?key=${API_KEY}`;
const API_URL_TTS = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_TTS}:generateContent?key=${API_KEY}`;
const MAX_RETRIES = 5;

// --- Schemas (from original script) ---
const RECEIPT_SCHEMA = {
    type: "OBJECT",
    properties: {
        date: {
            type: "STRING",
            description: "Transaction date in YYYY-MM-DD format.",
        },
        merchant_name: { type: "STRING" },
        total_amount: { type: "NUMBER" },
        currency: { type: "STRING" },
        line_items: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    description: { type: "STRING" },
                    quantity: { type: "NUMBER" },
                    line_total: { type: "NUMBER" },
                },
            },
        },
    },
    required: ["date", "merchant_name", "total_amount", "currency"],
};

const VOICE_DATA_SCHEMA = {
    type: "OBJECT",
    properties: {
        user_name: {
            type: "STRING",
            description: "Extracted user or customer name.",
        },
        phone_number: {
            type: "STRING",
            description: "Extracted phone number (digits only).",
        },
        product_name: {
            type: "STRING",
            description: "The name of the product.",
        },
        product_price: { type: "NUMBER" },
        amount_purchased: {
            type: "NUMBER",
            description: "The quantity/count of the product.",
        },
        buying_date: {
            type: "STRING",
            description: "Product buying date in YYYY-MM-DD format.",
        },
        selling_date: {
            type: "STRING",
            description: "Product selling date in YYYY-MM-DD format.",
        },
        date_difference_days: {
            type: "INTEGER",
            description:
                "The difference between selling date and buying date in days. Calculate this value yourself.",
        },
    },
    required: [
        "user_name",
        "phone_number",
        "product_name",
        "product_price",
        "buying_date",
        "selling_date",
        "date_difference_days",
        "amount_purchased",
    ],
};

function App() {
    // --- State Management ---
    const [status, setStatus] = useState({
        message: "Connecting to database...",
        isError: false,
    });
    const [isBusy, setIsBusy] = useState(false);
    const [busyTask, setBusyTask] = useState("");
    const [extractedDataList, setExtractedDataList] = useState([]);
    const [filteredDataList, setFilteredDataList] = useState([]);
    const [dateFilter, setDateFilter] = useState(null);
    const [activeRowIndex, setActiveRowIndex] = useState(null);
    const [jsonOutput, setJsonOutput] = useState(
        "Select a row in the table to view raw JSON data here."
    );
    const [isRecording, setIsRecording] = useState(false);
    const [micStatus, setMicStatus] = useState("Initializing Mic...");
    const [micReady, setMicReady] = useState(false);
    const [ttsStatus, setTtsStatus] = useState("");

    // Trends State
    const [isTrendsLoading, setIsTrendsLoading] = useState(false);
    const [trendsList, setTrendsList] = useState([]);
    const [trendsSummary, setTrendsSummary] = useState("");

    // Q&A State
    const [isQaLoading, setIsQaLoading] = useState(false);
    const [qaResponseHtml, setQaResponseHtml] = useState(
        "Your strategic answer will appear here..."
    );

    // Firebase State
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [collectionRef, setCollectionRef] = useState(null);

    // --- Refs ---
    const recorderRef = useRef(null);

    // --- Helper Functions ---

    const updateStatus = useCallback((message, isError = false) => {
        setStatus({ message, isError });
    }, []);

    const updateBusyState = useCallback(
        (busy, task = "Processing") => {
            setIsBusy(busy);
            setBusyTask(task);
            if (busy) {
                updateStatus(`${task}...`);
            }
        },
        [updateStatus]
    );

    // --- Core API & Utility Functions (from original script) ---

    const apiCallWithRetry = useCallback(
        async (url, payload) => {
            const headers = { "Content-Type": "application/json" };
            for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
                try {
                    const response = await fetch(url, {
                        method: "POST",
                        headers: headers,
                        body: JSON.stringify(payload),
                    });

                    if (!response.ok) {
                        if (
                            [429, 500, 503].includes(response.status) &&
                            attempt < MAX_RETRIES - 1
                        ) {
                            const delay =
                                Math.pow(2, attempt) * 1000 +
                                Math.random() * 1000;
                            updateStatus(
                                `Server error (${
                                    response.status
                                }). Retrying in ${Math.round(
                                    delay / 1000
                                )}s...`,
                                true
                            );
                            await new Promise((resolve) =>
                                setTimeout(resolve, delay)
                            );
                            continue;
                        }
                        const errorBody = await response.json();
                        throw new Error(
                            `API Error: ${response.status} - ${
                                errorBody.error?.message || "Unknown error"
                            }`
                        );
                    }
                    return response.json();
                } catch (e) {
                    console.error(
                        `Request error on attempt ${attempt + 1}:`,
                        e
                    );
                    if (attempt === MAX_RETRIES - 1) throw e;
                }
            }
        },
        [updateStatus]
    );

    const base64ToArrayBuffer = (base64) => {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    };

    const pcmToWav = (pcmData, sampleRate) => {
        const numChannels = 1;
        const bytesPerSample = 2; // 16-bit PCM
        const dataSize = pcmData.byteLength;
        const buffer = new ArrayBuffer(44 + dataSize);
        const view = new DataView(buffer);
        view.setUint32(0, 0x52494646, false); // "RIFF"
        view.setUint32(4, 36 + dataSize, true); // file-size - 8
        view.setUint32(8, 0x57415645, false); // "WAVE"
        view.setUint32(12, 0x666d7420, false); // "fmt "
        view.setUint32(16, 16, true); // 16 for PCM
        view.setUint16(20, 1, true); // AudioFormat = 1 (PCM)
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numChannels * bytesPerSample, true); // ByteRate
        view.setUint16(32, numChannels * bytesPerSample, true); // BlockAlign
        view.setUint16(34, 8 * bytesPerSample, true); // BitsPerSample
        view.setUint32(36, 0x64617461, false); // "data"
        view.setUint32(40, dataSize, true);
        const pcmView = new Uint8Array(pcmData);
        for (let i = 0; i < dataSize; i++) {
            view.setUint8(44 + i, pcmView[i]);
        }
        return new Blob([view], { type: "audio/wav" });
    };

    // --- Firebase Logic ---

    const saveDataToFirestore = useCallback(
        async (data) => {
            if (!isAuthReady || !collectionRef) {
                console.error("Auth or DB not ready. Cannot save.");
                updateStatus(
                    "Error: Database not ready. Cannot save data.",
                    true
                );
                return;
            }
            try {
                await addDoc(collectionRef, data);
                console.log(
                    "Data saved to Firestore successfully. Waiting for listener to update..."
                );
                // Note: The onSnapshot listener will automatically update extractedDataList
                // and trigger a re-render when the data is added to Firestore
            } catch (e) {
                console.error("Error saving to Firestore:", e);
                updateStatus("Error: Could not save data to database.", true);
            }
        },
        [isAuthReady, collectionRef, updateStatus]
    );

    const clearAllData = useCallback(async () => {
        if (!isAuthReady || !collectionRef) {
            updateStatus("Database not ready.", true);
            return;
        }

        console.warn(
            "clearAllData triggered. Bypassing window.confirm for React."
        );

        updateBusyState(true, "Clearing database");
        try {
            const querySnapshot = await getDocs(collectionRef);
            const deletePromises = [];
            querySnapshot.forEach((doc) => {
                deletePromises.push(deleteDoc(doc.ref));
            });
            await Promise.all(deletePromises);

            updateStatus("All data cleared from database.", false);
            setJsonOutput(
                "Select a row in the table to view raw JSON data here."
            );
            setQaResponseHtml("Your strategic answer will appear here...");
            setActiveRowIndex(null);
        } catch (e) {
            console.error("Error clearing data:", e);
            updateStatus("Error clearing data.", true);
        } finally {
            updateBusyState(false);
        }
    }, [isAuthReady, collectionRef, updateStatus, updateBusyState]);

    // --- Business Logic Functions ---

    const processReceipt = useCallback(
        async (file) => {
            if (
                !file.type.match("image.*") &&
                file.type !== "application/pdf"
            ) {
                updateStatus(
                    "Error: Please upload an image (JPG, PNG) or PDF.",
                    true
                );
                return;
            }
            updateBusyState(true, `Processing ${file.name}`);
            try {
                const base64Data = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result.split(",")[1]);
                    reader.onerror = (error) => reject(error);
                    reader.readAsDataURL(file);
                });
                const mimeType = file.type;
                const userPrompt =
                    "Extract all fields from this receipt image. Focus on date, merchant, total, currency, and detailed line items (description, quantity, price). Ensure the output strictly follows the JSON schema provided.";

                const payload = {
                    contents: [
                        {
                            parts: [
                                { text: userPrompt },
                                {
                                    inlineData: {
                                        mimeType: mimeType,
                                        data: base64Data,
                                    },
                                },
                            ],
                        },
                    ],
                    generationConfig: {
                        responseMimeType: "application/json",
                        responseSchema: RECEIPT_SCHEMA,
                        temperature: 0.0,
                    },
                };

                const response = await apiCallWithRetry(
                    API_URL_CONTENT,
                    payload
                );
                const jsonText =
                    response.candidates?.[0]?.content?.parts?.[0]?.text;

                if (jsonText) {
                    const extracted = JSON.parse(jsonText);
                    extracted.Source = "Receipt";
                    extracted["File Name"] = file.name;
                    await saveDataToFirestore(extracted);
                    updateStatus(
                        `Successfully extracted and saved data from ${file.name}. Data will appear in the table shortly...`,
                        false
                    );
                } else {
                    throw new Error(
                        "API returned no content or malformed response."
                    );
                }
            } catch (e) {
                console.error("Receipt Processing Error:", e);
                updateStatus(
                    `Extraction Failed: ${e.message || "Check console."}`,
                    true
                );
            } finally {
                updateBusyState(false);
            }
        },
        [updateBusyState, updateStatus, apiCallWithRetry, saveDataToFirestore]
    );

    const confirmTTSBangla = useCallback(
        async (data) => {
            setTtsStatus("🔊 Generating Bangla confirmation...");
            updateBusyState(true, "Generating Audio");

            const ttsText =
                `বাংলায় নিশ্চিত করছি: ব্যবহারকারী ${data.user_name}, ` +
                `পণ্য ${data.product_name}, দাম ${data.product_price} টাকা, ` +
                `কেনার তারিখ ${data.buying_date}, ` +
                `বিক্রির তারিখ ${data.selling_date}।`;

            const payload = {
                contents: [{ parts: [{ text: ttsText }] }],
                generationConfig: {
                    responseModalities: ["AUDIO"],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: "Kore" },
                        },
                    },
                },
            };

            try {
                const response = await apiCallWithRetry(API_URL_TTS, payload);
                const part = response.candidates?.[0]?.content?.parts?.[0];
                const audioData = part?.inlineData?.data;

                if (audioData) {
                    const sampleRate = 24000; // From original, check API docs
                    const pcmData = base64ToArrayBuffer(audioData);
                    const wavBlob = pcmToWav(pcmData, sampleRate);
                    const audioUrl = URL.createObjectURL(wavBlob);
                    const audio = new Audio(audioUrl);

                    setTtsStatus("🔊 Playing confirmation...");
                    audio.play();

                    audio.onended = () => {
                        setTtsStatus("Confirmation complete.");
                        setTimeout(() => setTtsStatus(""), 3000);
                        URL.revokeObjectURL(audioUrl);
                        updateBusyState(false);
                        updateStatus("Ready for input.", false);
                    };
                } else {
                    throw new Error("No audio data received from API.");
                }
            } catch (e) {
                console.error("TTS Error:", e);
                setTtsStatus("Error: TTS generation failed.");
                updateBusyState(false);
                updateStatus("Ready for input.", false);
            }
        },
        [updateBusyState, updateStatus, apiCallWithRetry]
    );

    const processVoiceData = useCallback(
        async (audioBlob) => {
            updateBusyState(true, "Converting voice to text");
            try {
                const audioArrayBuffer = await audioBlob.arrayBuffer();
                const base64Data = btoa(
                    String.fromCharCode(...new Uint8Array(audioArrayBuffer))
                );
                const mimeType = audioBlob.type;
                const userPrompt =
                    "You are an expert data entry assistant. Listen to the following Bengali audio and extract the user's name, phone number, product name, product price, quantity purchased, buying date, and selling date. Dates might be relative (like 'today', 'yesterday'). Today's date is " +
                    new Date().toLocaleDateString("en-CA") +
                    ". Convert all dates to YYYY-MM-DD format. Finally, calculate the difference in days between the selling and buying dates. Respond *only* with the JSON schema provided.";

                const payload = {
                    contents: [
                        {
                            parts: [
                                { text: userPrompt },
                                {
                                    inlineData: {
                                        mimeType: mimeType,
                                        data: base64Data,
                                    },
                                },
                            ],
                        },
                    ],
                    generationConfig: {
                        responseMimeType: "application/json",
                        responseSchema: VOICE_DATA_SCHEMA,
                        temperature: 0.0,
                    },
                };

                const response = await apiCallWithRetry(
                    API_URL_CONTENT,
                    payload
                );
                const jsonText =
                    response.candidates?.[0]?.content?.parts?.[0]?.text;

                if (jsonText) {
                    const extracted = JSON.parse(jsonText);
                    extracted.Source = "Voice";
                    extracted["File Name"] = "Voice Input";
                    await saveDataToFirestore(extracted);
                    updateStatus("Voice data extracted successfully.", false);
                    await confirmTTSBangla(extracted);
                } else {
                    throw new Error("Gemini could not parse voice data.");
                }
            } catch (e) {
                console.error("Voice Processing Error:", e);
                updateStatus(
                    `Voice Extraction Failed: ${e.message || "Check console."}`,
                    true
                );
                updateBusyState(false);
            }
            // Note: updateBusyState(false) is handled in confirmTTSBangla
        },
        [
            updateBusyState,
            updateStatus,
            apiCallWithRetry,
            saveDataToFirestore,
            confirmTTSBangla,
        ]
    );

    const startVoiceInput = useCallback(() => {
        if (isRecording) {
            if (
                recorderRef.current &&
                recorderRef.current.state !== "inactive"
            ) {
                recorderRef.current.stop();
            }
            return;
        }

        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => {
                const recorder = new MediaRecorder(stream);
                recorderRef.current = recorder;
                const audioChunks = [];

                recorder.ondataavailable = (event) =>
                    audioChunks.push(event.data);
                recorder.onstart = () => {
                    setIsRecording(true);
                    updateStatus("Listening for Bangla input...");
                    setMicStatus("Speak clearly in Bengali.");
                    setTimeout(() => {
                        if (
                            recorderRef.current &&
                            recorderRef.current.state === "recording"
                        ) {
                            recorderRef.current.stop();
                        }
                    }, 17000); // Max 17 seconds
                };
                recorder.onstop = () => {
                    setIsRecording(false);
                    stream.getTracks().forEach((track) => track.stop());
                    setMicStatus("Ready.");

                    if (audioChunks.length === 0) {
                        updateStatus(
                            "No audio recorded. Try speaking louder.",
                            true
                        );
                        return;
                    }
                    const audioBlob = new Blob(audioChunks, {
                        type: "audio/webm;codecs=opus",
                    });
                    processVoiceData(audioBlob);
                };
                recorder.start();
            })
            .catch((err) => {
                console.error("Microphone Access Error:", err);
                updateStatus(
                    "Error: Cannot access microphone. Check permissions.",
                    true
                );
                setMicStatus("Microphone access denied.");
            });
    }, [isRecording, updateStatus, processVoiceData]);

    const fetchMarketTrends = useCallback(async () => {
        setIsTrendsLoading(true);
        setTrendsList([]);
        setTrendsSummary("");

        const userPrompt =
            "What are the top 5 most sold goodies along with the current market price or fast-moving consumer goods in Bangladesh right now? List them as a simple numbered list. GIVE ME THE RESPONSE IN BANGLA. After the list, provide a very brief 1-2 sentence summary of the current market trend. Use today's date, " +
            new Date().toLocaleDateString("en-US", { timeZone: "Asia/Dhaka" }) +
            ", for context.";

        const payload = {
            contents: [{ parts: [{ text: userPrompt }] }],
            tools: [{ google_search: {} }],
        };

        try {
            const response = await apiCallWithRetry(API_URL_CONTENT, payload);
            const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
                const lines = text.split("\n");
                const trends = lines.filter((line) => line.match(/^\d\.\s/));
                const summary = lines.slice(trends.length).join(" ").trim();
                setTrendsList(
                    trends.map((item) => item.substring(item.indexOf(" ") + 1))
                );
                setTrendsSummary(summary);
            } else {
                throw new Error("No text returned from Gemini.");
            }
        } catch (e) {
            console.error("Market Trends Error:", e);
            setTrendsSummary(`Error fetching trends: ${e.message}`);
        } finally {
            setIsTrendsLoading(false);
        }
    }, [apiCallWithRetry]);

    const askBishleshok = useCallback(
        async (question) => {
            if (!question) {
                setQaResponseHtml(
                    "<p>Please enter a question in the text box.</p>"
                );
                return;
            }
            if (extractedDataList.length === 0) {
                setQaResponseHtml(
                    "<p>There is no data in the database to analyze. Please add data first.</p>"
                );
                return;
            }

            setIsQaLoading(true);
            setQaResponseHtml("");

            const currentDate = new Date().toLocaleDateString("en-CA");
            const dataContext = JSON.stringify(extractedDataList);
            const userPrompt = `You are 'Bishleshok.ai' (বিশ্লেষক), an expert business analyst AI for a small business in Bangladesh. Start with greeting the user as Bishleshok.ai. The current date is ${currentDate}. answer in actionable Bangla.Also if there is any missing business data dont hallucinate rather give instructions to that related fields and some datas related to that so that user feels confident and not focus on the missing data. Also if user asks outside the JSON data, answer properly with the business plan. And the currency is only BDT.
Please format your entire response using Markdown (e.g., **bold**, *italic*, lists, and tables).

DATA:
${dataContext}

QUESTION:
${question}

ANSWER (in Markdown):`;

            const payload = {
                contents: [{ parts: [{ text: userPrompt }] }],
            };

            try {
                const response = await apiCallWithRetry(
                    API_URL_CONTENT,
                    payload
                );
                const answer =
                    response.candidates?.[0]?.content?.parts?.[0]?.text;
                if (answer) {
                    setQaResponseHtml(marked.parse(answer));
                } else {
                    throw new Error("No answer returned from Gemini.");
                }
            } catch (e) {
                console.error("Bishleshok Q&A Error:", e);
                setQaResponseHtml(
                    `<p class="text-red-400">দুঃখিত, একটি ত্রুটি ঘটেছে: ${e.message}</p>`
                );
            } finally {
                setIsQaLoading(false);
            }
        },
        [extractedDataList, apiCallWithRetry]
    );

    const saveToExcel = useCallback(() => {
        const dataToExport = dateFilter ? filteredDataList : extractedDataList;
        if (dataToExport.length === 0) {
            updateStatus("No data to export!", true);
            return;
        }
        let csv =
            "Source Type,User/Merchant,Product Name,Price/Total,Buy Date,Sell Date,Date Difference (Days),Raw JSON\n";
        dataToExport.forEach((data) => {
            const isReceipt = data.Source === "Receipt";
            let row = [];
            row.push(isReceipt ? "Receipt" : "Voice");
            row.push(`"${isReceipt ? data.merchant_name : data.user_name}"`);
            row.push(
                `"${
                    isReceipt
                        ? data.line_items
                            ? data.line_items
                                  .map((i) => i.description)
                                  .join("; ")
                            : "N/A"
                        : data.product_name
                }"`
            );
            row.push(
                isReceipt
                    ? `${data.currency || ""} ${data.total_amount}`
                    : data.product_price
            );
            row.push(isReceipt ? data.date : data.buying_date);
            row.push(isReceipt ? "N/A" : data.selling_date);
            row.push(isReceipt ? "N/A" : data.date_difference_days);
            row.push(`"${JSON.stringify(data).replace(/"/g, '""')}"`);
            csv += row.join(",") + "\n";
        });
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", "ProductData.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        updateStatus(
            `Data exported successfully to CSV! (${dataToExport.length} records)`,
            false
        );
    }, [extractedDataList, filteredDataList, dateFilter, updateStatus]);

    // --- Event Handlers ---

    const handleFileSelect = useCallback(
        (event) => {
            const file = event.target.files[0];
            if (file) {
                processReceipt(file);
            }
        },
        [processReceipt]
    );

    const handleFileDrop = useCallback(
        (event) => {
            event.preventDefault();
            // Handle visual state in ReceiptInput component
            const file = event.dataTransfer.files[0];
            if (file) {
                processReceipt(file);
            }
        },
        [processReceipt]
    );

    const handleRowClick = useCallback((index, dataArray) => {
        setActiveRowIndex(index);
        setJsonOutput(JSON.stringify(dataArray[index], null, 2));
    }, []);

    const handleQaSubmit = useCallback(
        (question) => {
            askBishleshok(question);
        },
        [askBishleshok]
    );

    // --- Initialization Effects ---

    // 1. Initialize Microphone
    useEffect(() => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices
                .getUserMedia({ audio: true })
                .then((stream) => {
                    setMicStatus("Microphone ready.");
                    setMicReady(true);
                    stream.getTracks().forEach((track) => track.stop());
                })
                .catch(() => {
                    setMicStatus("Microphone access denied.");
                    setMicReady(false);
                });
        } else {
            setMicStatus("Microphone NOT supported.");
            setMicReady(false);
        }
    }, []);

    // 2. Initialize Firebase and Auth
    useEffect(() => {
        updateStatus("Connecting to database...", false);
        const unsubscribe = signInUser((uid) => {
            if (uid) {
                setCollectionRef(getDataCollectionRef(uid));
                setIsAuthReady(true);
            } else {
                setIsAuthReady(false);
                setCollectionRef(null);
            }
        });
        // Cleanup listener on component unmount
        return () => unsubscribe();
    }, [updateStatus]);

    // 3. Set up Firestore data listener
    useEffect(() => {
        if (!isAuthReady || !collectionRef) {
            // Not ready, or user signed out
            setExtractedDataList([]); // Clear data
            setFilteredDataList([]);
            return;
        }

        updateStatus("Loading data from database...", false);
        const q = query(collectionRef);
        let isInitialLoad = true;

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const data = [];
                snapshot.forEach((doc) => {
                    data.push({ ...doc.data(), id: doc.id });
                });

                setExtractedDataList((prevList) => {
                    const previousCount = prevList.length;
                    const newCount = data.length;

                    if (isInitialLoad) {
                        isInitialLoad = false;
                        if (newCount > 0) {
                            updateStatus(
                                `✓ Data loaded successfully (${newCount} item${
                                    newCount > 1 ? "s" : ""
                                }). All data is displayed in the table below.`,
                                false
                            );
                        } else {
                            updateStatus(
                                `Data loaded (${newCount} items). Ready for input.`,
                                false
                            );
                        }
                    } else if (newCount > previousCount) {
                        // New data was added
                        updateStatus(
                            `✓ Data updated! ${newCount} item${
                                newCount > 1 ? "s" : ""
                            } now in database. All data displayed below.`,
                            false
                        );
                    }

                    return data;
                });

                setJsonOutput(
                    "Select a row in the table to view raw JSON data here."
                );
                setActiveRowIndex(null);
            },
            (error) => {
                console.error("Error loading data from Firestore:", error);
                updateStatus(
                    "Error loading data. Check console and Firebase Rules.",
                    true
                );
            }
        );

        // Cleanup listener on unmount or if auth/collection changes
        return () => unsubscribe();
    }, [isAuthReady, collectionRef, updateStatus]);

    // 4. Apply date filter
    useEffect(() => {
        if (!dateFilter) {
            setFilteredDataList([]);
            return;
        }

        const filtered = extractedDataList.filter((item) => {
            const date =
                item.Source === "Receipt" ? item.date : item.buying_date;
            if (!date) return false;
            return date >= dateFilter.startDate && date <= dateFilter.endDate;
        });

        setFilteredDataList(filtered);
    }, [dateFilter, extractedDataList]);

    const handleFilterChange = useCallback((filter) => {
        setDateFilter(filter);
    }, []);

    // 5. Staggered fade-in animations for panels
    useEffect(() => {
        document.querySelectorAll(".panel-fade-in").forEach((panel, index) => {
            setTimeout(() => {
                panel.style.animationDelay = `${index * 100}ms`;
                panel.classList.add("panel-fade-in");
            }, 0);
        });
    }, []);

    // --- Render ---
    const hasData = extractedDataList.length > 0;
    const displayData = dateFilter ? filteredDataList : extractedDataList;

    return (
        <div className="min-h-screen bg-[#0f0e1a]">
            <Header />
            <div className="max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                <div className="space-y-4 sm:space-y-5 md:space-y-6">
                    {/* Input Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 items-stretch">
                        <div className="lg:col-span-3">
                            <ReceiptInput
                                isBusy={isBusy}
                                onFileSelect={handleFileSelect}
                                onFileDrop={handleFileDrop}
                            />
                        </div>
                        <div className="lg:col-span-2">
                            <VoiceInput
                                isBusy={isBusy}
                                isRecording={isRecording}
                                micStatus={micStatus}
                                micReady={micReady}
                                ttsStatus={ttsStatus}
                                onStartVoiceInput={startVoiceInput}
                            />
                        </div>
                    </div>

                    {/* Status Area */}
                    <StatusArea
                        message={isBusy ? busyTask : status.message}
                        isError={status.isError}
                        isLoading={isBusy}
                    />

                    {/* KPI Cards */}
                    {hasData && <KPICards data={displayData} />}

                    {/* Dashboard Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                        <Dashboard data={displayData} />
                        <MarketTrends
                            isLoading={isTrendsLoading}
                            trends={trendsList}
                            summary={trendsSummary}
                            onFetchTrends={fetchMarketTrends}
                            isBusy={isBusy}
                        />
                    </div>

                    {/* Predictive Analytics */}
                    {hasData && <PredictiveAnalytics data={displayData} />}

                    {/* AI Assistant */}
                    <BishleshokQA
                        isBusy={isBusy || isQaLoading}
                        isLoading={isQaLoading}
                        responseHtml={qaResponseHtml}
                        onSubmit={handleQaSubmit}
                        hasData={hasData}
                    />

                    {/* Date Filter */}
                    {hasData && (
                        <DateFilter
                            onFilterChange={handleFilterChange}
                            dataLength={extractedDataList.length}
                        />
                    )}

                    {/* Data Table */}
                    <DataTable
                        data={displayData}
                        activeIndex={activeRowIndex}
                        onRowClick={handleRowClick}
                    />

                    {/* JSON Output & Actions */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
                        <div className="lg:col-span-3">
                            <JsonOutput json={jsonOutput} />
                        </div>
                        <div className="lg:col-span-2">
                            <ActionButtons
                                isBusy={isBusy}
                                hasData={hasData}
                                onSave={saveToExcel}
                                onClear={clearAllData}
                            />
                        </div>
                    </div>

                    <Footer />
                </div>
            </div>
        </div>
    );
}

export default App;
