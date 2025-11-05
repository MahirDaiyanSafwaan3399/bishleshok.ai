import React, { useMemo, useRef } from "react";
import { Doughnut, Bar } from "react-chartjs-2";

// Note: Chart.js and its components were already registered in src/main.jsx
// So we can just use <Doughnut> and <Bar> directly.

function Dashboard({ data }) {
    // Refs to hold the chart instances
    const valueChartRef = useRef(null);
    const quantityChartRef = useRef(null);

    // --- Chart Data Aggregation ---
    // We use useMemo to re-calculate this *only* when the `data` prop changes.
    const chartData = useMemo(() => {
        const itemQuantityData = {};
        const itemValueData = {};

        data.forEach((item) => {
            if (item.Source === "Receipt" && item.line_items) {
                item.line_items.forEach((line) => {
                    const name = line.description || "Unknown Item";
                    const qty = line.quantity || 1;
                    const value = line.line_total || 0;

                    itemQuantityData[name] =
                        (itemQuantityData[name] || 0) + qty;
                    itemValueData[name] = (itemValueData[name] || 0) + value;
                });
            } else if (item.Source === "Voice") {
                const name = item.product_name || "Unknown Item";
                const qty = item.amount_purchased || 1;
                const value = item.product_price || 0;

                itemQuantityData[name] = (itemQuantityData[name] || 0) + qty;
                itemValueData[name] = (itemValueData[name] || 0) + value;
            }
        });

        return { itemQuantityData, itemValueData };
    }, [data]);

    // --- Chart Styling (from original) ---
    const coolColors = [
        "#6366f1",
        "#3b82f6",
        "#14b8a6",
        "#a855f7",
        "#ec4899",
        "#f97316",
        "#84cc16",
    ];

    // --- Chart Configuration Objects ---

    // 1. Doughnut Chart (Total Value)
    const valueChartConfig = {
        data: {
            labels:
                Object.keys(chartData.itemValueData).length > 0
                    ? Object.keys(chartData.itemValueData)
                    : ["No Data"],
            datasets: [
                {
                    data:
                        Object.keys(chartData.itemValueData).length > 0
                            ? Object.values(chartData.itemValueData)
                            : [1],
                    backgroundColor:
                        Object.keys(chartData.itemValueData).length > 0
                            ? coolColors
                            : ["#374151"],
                    borderColor: "#020617",
                    borderWidth: 4,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    titleFont: {
                        family: "'Space Grotesk', sans-serif",
                        weight: "bold",
                    },
                    bodyFont: { family: "'Space Grotesk', sans-serif" },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: (context) =>
                            `${context.label}: ${context.raw.toFixed(2)}`,
                    },
                },
            },
        },
    };

    // 2. Bar Chart (Total Quantity)
    const quantityChartConfig = {
        data: {
            labels:
                Object.keys(chartData.itemQuantityData).length > 0
                    ? Object.keys(chartData.itemQuantityData)
                    : ["No Data"],
            datasets: [
                {
                    label: "Total Quantity",
                    data:
                        Object.keys(chartData.itemQuantityData).length > 0
                            ? Object.values(chartData.itemQuantityData)
                            : [0],
                    backgroundColor: coolColors,
                    borderRadius: 4,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: "y", // Horizontal bar chart
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { display: false },
                    ticks: { color: "#94a3b8" },
                },
                x: {
                    grid: { color: "rgba(255, 255, 255, 0.1)" },
                    ticks: { color: "#94a3b8" },
                },
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    titleFont: {
                        family: "'Space Grotesk', sans-serif",
                        weight: "bold",
                    },
                    bodyFont: { family: "'Space Grotesk', sans-serif" },
                    padding: 12,
                    cornerRadius: 8,
                },
            },
        },
    };

    return (
        <div
            className="glass-panel p-8 space-y-6 panel-fade-in"
            style={{ animationDelay: "400ms" }}
        >
            <h2 className="text-2xl font-semibold border-b border-white/10 pb-4 text-gray-100">
                Product Analysis Dashboard
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="chart-container">
                    <Doughnut ref={valueChartRef} {...valueChartConfig} />
                    <p className="text-center text-sm text-gray-400 mt-2">
                        Total Value by Item
                    </p>
                </div>
                <div className="chart-container">
                    <Bar ref={quantityChartRef} {...quantityChartConfig} />
                    <p className="text-center text-sm text-gray-400 mt-2">
                        Total Quantity by Item
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
