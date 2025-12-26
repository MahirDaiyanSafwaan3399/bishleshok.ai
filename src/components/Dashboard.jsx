import React, { useMemo, useRef } from "react";
import { Doughnut, Bar, Line } from "react-chartjs-2";

function Dashboard({ data }) {
    const valueChartRef = useRef(null);
    const quantityChartRef = useRef(null);
    const timeSeriesRef = useRef(null);

    const chartData = useMemo(() => {
        const itemQuantityData = {};
        const itemValueData = {};
        const dailyRevenue = {};
        const dailyQuantity = {};

        data.forEach((item) => {
            const date = item.Source === "Receipt" ? item.date : item.buying_date;
            
            if (item.Source === "Receipt" && item.line_items) {
                item.line_items.forEach((line) => {
                    const name = line.description || "Unknown Item";
                    const qty = line.quantity || 1;
                    const value = line.line_total || 0;

                    itemQuantityData[name] = (itemQuantityData[name] || 0) + qty;
                    itemValueData[name] = (itemValueData[name] || 0) + value;
                });
                if (date) {
                    dailyRevenue[date] = (dailyRevenue[date] || 0) + (item.total_amount || 0);
                }
            } else if (item.Source === "Voice") {
                const name = item.product_name || "Unknown Item";
                const qty = item.amount_purchased || 1;
                const value = item.product_price || 0;

                itemQuantityData[name] = (itemQuantityData[name] || 0) + qty;
                itemValueData[name] = (itemValueData[name] || 0) + value;
                
                if (date) {
                    dailyRevenue[date] = (dailyRevenue[date] || 0) + (value * qty);
                    dailyQuantity[date] = (dailyQuantity[date] || 0) + qty;
                }
            }
        });

        const sortedDates = Object.keys(dailyRevenue).sort();
        const timeSeriesData = {
            dates: sortedDates,
            revenues: sortedDates.map(d => dailyRevenue[d] || 0),
            quantities: sortedDates.map(d => dailyQuantity[d] || 0),
        };

        return { itemQuantityData, itemValueData, timeSeriesData };
    }, [data]);

    // Professional Purple Theme - Colorful Visualization Palette
    const vibrantColors = [
        "#7c3aed", // vibrant purple
        "#8b5cf6", // medium purple
        "#a78bfa", // light purple/lavender
        "#06b6d4", // cyan/teal
        "#ec4899", // pink
        "#f59e0b", // amber
        "#10b981", // emerald
        "#3b82f6", // blue
        "#f97316", // orange
        "#6366f1", // indigo
        "#14b8a6", // teal
        "#d946ef", // fuchsia
    ];

    const chartOptionsBase = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 1500,
            easing: 'easeInOutQuart',
        },
        plugins: {
            legend: {
                display: false,
            },
                tooltip: {
                    backgroundColor: "rgba(30, 27, 46, 0.95)",
                    titleColor: "#ffffff",
                    bodyColor: "#ffffff",
                    borderColor: "#7c3aed",
                    borderWidth: 2,
                    padding: 16,
                    cornerRadius: 12,
                titleFont: {
                    size: 14,
                    weight: "700",
                },
                bodyFont: {
                    size: 13,
                    weight: "500",
                },
                displayColors: true,
                boxPadding: 8,
                callbacks: {
                    labelColor: function(context) {
                        return {
                            borderColor: vibrantColors[context.datasetIndex % vibrantColors.length],
                            backgroundColor: vibrantColors[context.datasetIndex % vibrantColors.length],
                            borderWidth: 3,
                            borderRadius: 2,
                        };
                    },
                },
            },
        },
    };

    // Value Chart (Doughnut) with gradient colors
    const valueChartConfig = useMemo(() => {
        const labels = Object.keys(chartData.itemValueData).length > 0
            ? Object.keys(chartData.itemValueData)
            : ["No Data"];
        const values = Object.keys(chartData.itemValueData).length > 0
            ? Object.values(chartData.itemValueData)
            : [1];

        // Create colorful background colors
        const backgroundColors = labels.map((_, index) => 
            vibrantColors[index % vibrantColors.length]
        );

        return {
            data: {
                labels,
                datasets: [
                    {
                        data: values,
                        backgroundColor: backgroundColors,
                        borderColor: "#1e1b2e",
                        borderWidth: 4,
                        hoverBorderWidth: 6,
                        hoverOffset: 10,
                    },
                ],
            },
            options: {
                ...chartOptionsBase,
                cutout: '60%',
                plugins: {
                    ...chartOptionsBase.plugins,
                    tooltip: {
                        ...chartOptionsBase.plugins.tooltip,
                        callbacks: {
                            ...chartOptionsBase.plugins.tooltip.callbacks,
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = values.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ৳${value.toFixed(2)} (${percentage}%)`;
                            },
                        },
                    },
                },
                animation: {
                    ...chartOptionsBase.animation,
                    animateRotate: true,
                    animateScale: true,
                },
            },
        };
    }, [chartData.itemValueData]);

    // Quantity Chart (Bar) with gradient
    const quantityChartConfig = useMemo(() => {
        const labels = Object.keys(chartData.itemQuantityData).length > 0
            ? Object.keys(chartData.itemQuantityData)
            : ["No Data"];
        const values = Object.keys(chartData.itemQuantityData).length > 0
            ? Object.values(chartData.itemQuantityData)
            : [0];

        // Create gradient colors for each bar
        const backgroundColors = labels.map((_, index) => 
            vibrantColors[index % vibrantColors.length]
        );

        return {
            data: {
                labels,
                datasets: [
                    {
                        label: "Quantity",
                        data: values,
                        backgroundColor: backgroundColors,
                        borderRadius: 12,
                        borderSkipped: false,
                        barThickness: 'flex',
                        maxBarThickness: 60,
                    },
                ],
            },
            options: {
                ...chartOptionsBase,
                indexAxis: "y",
                layout: {
                    padding: {
                        left: 10,
                        right: 10,
                    },
                },
                plugins: {
                    ...chartOptionsBase.plugins,
                    tooltip: {
                        ...chartOptionsBase.plugins.tooltip,
                        callbacks: {
                            ...chartOptionsBase.plugins.tooltip.callbacks,
                            label: (context) => `Quantity: ${context.parsed.x}`,
                        },
                    },
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: {
                            display: true,
                            color: "rgba(124, 58, 237, 0.15)",
                            lineWidth: 1,
                        },
                        ticks: {
                            color: "#e9e5f0",
                            font: {
                                size: 12,
                                weight: "500",
                            },
                            padding: 8,
                        },
                    },
                    y: {
                        grid: {
                            display: false,
                        },
                        ticks: {
                            color: "#e9e5f0",
                            font: {
                                size: 11,
                                weight: "500",
                            },
                            padding: 8,
                            maxRotation: 0,
                            autoSkip: false,
                            callback: function(value, index, ticks) {
                                const label = this.getLabelForValue(value);
                                // Truncate long labels to prevent overflow
                                if (label && label.length > 18) {
                                    return label.substring(0, 16) + '...';
                                }
                                return label;
                            },
                        },
                        afterFit: function(scaleInstance) {
                            // Ensure minimum width for y-axis labels
                            scaleInstance.width = Math.max(scaleInstance.width, 150);
                        },
                    },
                },
            },
        };
    }, [chartData.itemQuantityData]);

    // Time Series Chart with gradient fill
    const timeSeriesChartConfig = useMemo(() => {
        const dates = chartData.timeSeriesData.dates.length > 0 
            ? chartData.timeSeriesData.dates 
            : ["No Data"];
        const revenues = chartData.timeSeriesData.revenues.length > 0
            ? chartData.timeSeriesData.revenues
            : [0];

        return {
            data: {
                labels: dates,
                datasets: [
                    {
                        label: "Daily Revenue",
                        data: revenues,
                        borderColor: "#7c3aed",
                        backgroundColor: (context) => {
                            const ctx = context.chart.ctx;
                            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                            gradient.addColorStop(0, "rgba(124, 58, 237, 0.4)");
                            gradient.addColorStop(0.5, "rgba(139, 92, 246, 0.3)");
                            gradient.addColorStop(1, "rgba(124, 58, 237, 0.05)");
                            return gradient;
                        },
                        borderWidth: 4,
                        tension: 0.5,
                        fill: true,
                        pointRadius: 6,
                        pointHoverRadius: 10,
                        pointBackgroundColor: "#7c3aed",
                        pointBorderColor: "#ffffff",
                        pointBorderWidth: 3,
                        pointHoverBackgroundColor: "#a78bfa",
                        pointHoverBorderColor: "#ffffff",
                        pointHoverBorderWidth: 4,
                    },
                ],
            },
            options: {
                ...chartOptionsBase,
                plugins: {
                    ...chartOptionsBase.plugins,
                    legend: {
                        display: true,
                        position: "top",
                        labels: {
                            color: "#a78bfa",
                            font: {
                                size: 13,
                                weight: "700",
                            },
                            usePointStyle: true,
                            pointStyle: 'circle',
                            padding: 25,
                            boxWidth: 12,
                            boxHeight: 12,
                        },
                    },
                    tooltip: {
                        ...chartOptionsBase.plugins.tooltip,
                        callbacks: {
                            ...chartOptionsBase.plugins.tooltip.callbacks,
                            label: (context) =>
                                `Revenue: ৳${context.raw.toFixed(2)}`,
                        },
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            display: true,
                            color: "rgba(124, 58, 237, 0.15)",
                            lineWidth: 1,
                            drawBorder: false,
                        },
                        ticks: {
                            color: "#e9e5f0",
                            font: {
                                size: 12,
                                weight: "500",
                            },
                            padding: 10,
                            callback: function(value) {
                                return '৳' + value.toLocaleString();
                            },
                        },
                    },
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false,
                        },
                        ticks: {
                            color: "#d4d4e8",
                            font: {
                                size: 11,
                                weight: "500",
                            },
                            maxRotation: 45,
                            minRotation: 45,
                            padding: 8,
                        },
                    },
                },
                interaction: {
                    intersect: false,
                    mode: 'index',
                },
            },
        };
    }, [chartData.timeSeriesData]);

    return (
        <div className="modern-card p-4 sm:p-6 fade-in">
            <div className="mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-white mb-2 tracking-tight">
                    Product Analysis
                </h2>
                <p className="text-xs sm:text-sm text-[#e9e5f0] font-medium leading-relaxed">
                    Revenue and quantity insights
                </p>
            </div>
            
            {chartData.timeSeriesData.dates.length > 0 && (
                <div className="mb-4 sm:mb-6">
                    <h3 className="text-xs sm:text-sm font-bold text-[#56D7B4] mb-3 sm:mb-4 tracking-wide uppercase">
                        Revenue Trend Over Time
                    </h3>
                    <div className="chart-container">
                        <Line ref={timeSeriesRef} {...timeSeriesChartConfig} />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#a78bfa] mb-3 sm:mb-4 tracking-wide uppercase">
                        Total Value by Item
                    </h3>
                    <div className="chart-container">
                        <Doughnut ref={valueChartRef} {...valueChartConfig} />
                    </div>
                </div>
                <div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#F78D60] mb-3 sm:mb-4 tracking-wide uppercase">
                        Total Quantity by Item
                    </h3>
                    <div className="chart-container">
                        <Bar ref={quantityChartRef} {...quantityChartConfig} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;