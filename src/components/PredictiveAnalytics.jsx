import React, { useState, useMemo, useEffect } from "react";
import { Line } from "react-chartjs-2";

function PredictiveAnalytics({ data }) {
    const [forecastData, setForecastData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [anomalies, setAnomalies] = useState([]);
    const [recommendations, setRecommendations] = useState([]);

    const historicalData = useMemo(() => {
        if (!data || data.length === 0) return null;

        const dailyRevenue = {};
        const dailyItems = {};
        const productSales = {};

        data.forEach((item) => {
            const date = item.Source === "Receipt" ? item.date : item.buying_date;
            if (!date) return;

            if (item.Source === "Receipt") {
                const revenue = item.total_amount || 0;
                dailyRevenue[date] = (dailyRevenue[date] || 0) + revenue;
                
                if (item.line_items) {
                    item.line_items.forEach((line) => {
                        dailyItems[date] = (dailyItems[date] || 0) + (line.quantity || 0);
                        const productName = line.description || "Unknown";
                        productSales[productName] = (productSales[productName] || 0) + (line.quantity || 0);
                    });
                }
            } else {
                const revenue = (item.product_price || 0) * (item.amount_purchased || 0);
                dailyRevenue[date] = (dailyRevenue[date] || 0) + revenue;
                dailyItems[date] = (dailyItems[date] || 0) + (item.amount_purchased || 0);
                const productName = item.product_name || "Unknown";
                productSales[productName] = (productSales[productName] || 0) + (item.amount_purchased || 0);
            }
        });

        const sortedDates = Object.keys(dailyRevenue).sort();
        const last30Days = sortedDates.slice(-30);

        return {
            dates: last30Days,
            revenues: last30Days.map((d) => dailyRevenue[d] || 0),
            items: last30Days.map((d) => dailyItems[d] || 0),
            productSales,
        };
    }, [data]);

    useEffect(() => {
        if (!historicalData) return;

        const detectedAnomalies = [];
        const revenues = historicalData.revenues;
        if (revenues.length === 0) return;
        
        const mean = revenues.reduce((a, b) => a + b, 0) / revenues.length;
        const variance = revenues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / revenues.length;
        const stdDev = Math.sqrt(variance);

        if (stdDev === 0) return;

        historicalData.dates.forEach((date, index) => {
            const value = revenues[index];
            const zScore = Math.abs((value - mean) / stdDev);
            
            if (zScore > 2 && value > 0) {
                detectedAnomalies.push({
                    date,
                    value,
                    type: value > mean ? "spike" : "drop",
                    severity: zScore > 3 ? "high" : "medium",
                });
            }
        });

        setAnomalies(detectedAnomalies);
    }, [historicalData]);

    const generateForecast = async () => {
        if (!historicalData || historicalData.dates.length === 0) {
            alert("No historical data available. Please add some transactions first.");
            return;
        }

        setIsLoading(true);
        
        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Use all available data or last 7 days, whichever is smaller
            const dataPoints = historicalData.revenues;
            const numDays = Math.max(1, Math.min(dataPoints.length, 7));
            const recentRevenue = dataPoints.slice(-numDays);
            
            // Calculate average revenue
            const totalRevenue = recentRevenue.reduce((a, b) => a + b, 0);
            const avgRevenue = totalRevenue > 0 ? totalRevenue / numDays : 1000; // Default to 1000 if all zeros
            
            // Calculate trend (if we have at least 2 data points)
            let trend = 0;
            if (numDays >= 2 && recentRevenue.length >= 2) {
                const firstValue = recentRevenue[0] || avgRevenue;
                const lastValue = recentRevenue[recentRevenue.length - 1] || avgRevenue;
                trend = (lastValue - firstValue) / (numDays - 1);
            }

            const forecastDays = 14;
            const forecastDates = [];
            const forecastValues = [];
            const confidenceUpper = [];
            const confidenceLower = [];

            // Get the last date from historical data and parse it correctly
            const lastHistoricalDateStr = historicalData.dates[historicalData.dates.length - 1];
            
            // Parse the date string (expected format: YYYY-MM-DD)
            let baseDate;
            if (lastHistoricalDateStr && lastHistoricalDateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                baseDate = new Date(lastHistoricalDateStr + 'T00:00:00');
            } else {
                // Fallback: use today's date
                baseDate = new Date();
                baseDate.setHours(0, 0, 0, 0);
            }

            // Validate the date
            if (isNaN(baseDate.getTime())) {
                baseDate = new Date();
                baseDate.setHours(0, 0, 0, 0);
            }

            for (let i = 1; i <= forecastDays; i++) {
                const forecastDate = new Date(baseDate);
                forecastDate.setDate(forecastDate.getDate() + i);
                
                // Validate the date before converting to ISO string
                if (!isNaN(forecastDate.getTime())) {
                    forecastDates.push(forecastDate.toISOString().split("T")[0]);
                } else {
                    // Fallback: create date from baseDate + i days using string manipulation
                    const fallbackDate = new Date(baseDate.getTime() + (i * 24 * 60 * 60 * 1000));
                    if (!isNaN(fallbackDate.getTime())) {
                        forecastDates.push(fallbackDate.toISOString().split("T")[0]);
                    } else {
                        // Last resort: use a simple date string
                        const year = baseDate.getFullYear();
                        const month = String(baseDate.getMonth() + 1).padStart(2, '0');
                        const day = String(baseDate.getDate() + i).padStart(2, '0');
                        forecastDates.push(`${year}-${month}-${day}`);
                    }
                }

                const predicted = Math.max(0, avgRevenue + trend * i);
                forecastValues.push(predicted);
                confidenceUpper.push(predicted * 1.2);
                confidenceLower.push(Math.max(0, predicted * 0.8));
            }

            setForecastData({
                dates: forecastDates,
                values: forecastValues,
                confidenceUpper,
                confidenceLower,
            });

            // Generate recommendations
            const topProducts = Object.entries(historicalData.productSales || {})
                .filter(([, count]) => count > 0)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([name]) => name);

            const totalForecastRevenue = forecastValues.reduce((a, b) => a + b, 0);

            const newRecommendations = [];
            
            if (topProducts.length > 0) {
                newRecommendations.push({
                    type: "inventory",
                    priority: "high",
                    message: `Consider increasing stock for ${topProducts[0]} as it's showing strong sales trends.`,
                    action: `Order 20% more ${topProducts[0]} before next week.`,
                });
            }

            newRecommendations.push({
                type: "cashflow",
                priority: "medium",
                message: `Based on forecast, expected revenue for next 14 days: ৳${totalForecastRevenue.toFixed(2)}`,
                action: "Plan inventory purchases accordingly to maintain cash flow.",
            });

            if (anomalies.length > 0) {
                newRecommendations.push({
                    type: "alert",
                    priority: "high",
                    message: `Detected ${anomalies.length} unusual pattern${anomalies.length > 1 ? 's' : ''} in recent sales.`,
                    action: "Review transaction data for these dates to understand causes.",
                });
            }

            setRecommendations(newRecommendations);
        } catch (error) {
            console.error("Forecast generation error:", error);
            alert("Error generating forecast. Please check the console for details.");
        } finally {
            setIsLoading(false);
        }
    };

    const forecastChartData = useMemo(() => {
        if (!historicalData || !forecastData) {
            return null;
        }

        const allDates = [...historicalData.dates, ...forecastData.dates];
        const historicalValues = [...historicalData.revenues, ...new Array(forecastData.dates.length).fill(null)];
        const forecastValues = [...new Array(historicalData.dates.length).fill(null), ...forecastData.values];
        const upperBound = [...new Array(historicalData.dates.length).fill(null), ...forecastData.confidenceUpper];
        const lowerBound = [...new Array(historicalData.dates.length).fill(null), ...forecastData.confidenceLower];

        const chartData = {
            labels: allDates,
            datasets: [
                {
                    label: "Historical Revenue",
                    data: historicalValues,
                    borderColor: "#7c3aed",
                    backgroundColor: (context) => {
                        const ctx = context.chart.ctx;
                        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                        gradient.addColorStop(0, "rgba(124, 58, 237, 0.4)");
                        gradient.addColorStop(0.5, "rgba(139, 92, 246, 0.25)");
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
                {
                    label: "Forecasted Revenue",
                    data: forecastValues,
                    borderColor: "#a78bfa",
                    backgroundColor: (context) => {
                        const ctx = context.chart.ctx;
                        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                        gradient.addColorStop(0, "rgba(167, 139, 250, 0.3)");
                        gradient.addColorStop(0.5, "rgba(124, 58, 237, 0.2)");
                        gradient.addColorStop(1, "rgba(167, 139, 250, 0.05)");
                        return gradient;
                    },
                    borderWidth: 4,
                    borderDash: [8, 6],
                    tension: 0.5,
                    fill: true,
                    pointRadius: 6,
                    pointHoverRadius: 10,
                    pointBackgroundColor: "#a78bfa",
                    pointBorderColor: "#1e1b2e",
                    pointBorderWidth: 3,
                    pointHoverBackgroundColor: "#7c3aed",
                    pointHoverBorderColor: "#ffffff",
                    pointHoverBorderWidth: 4,
                },
                {
                    label: "Upper Confidence",
                    data: upperBound,
                    borderColor: "rgba(167, 139, 250, 0.4)",
                    backgroundColor: "rgba(167, 139, 250, 0.08)",
                    borderWidth: 2,
                    borderDash: [4, 4],
                    fill: "+1",
                    pointRadius: 0,
                    tension: 0.4,
                },
                {
                    label: "Lower Confidence",
                    data: lowerBound,
                    borderColor: "rgba(167, 139, 250, 0.4)",
                    backgroundColor: "rgba(167, 139, 250, 0.08)",
                    borderWidth: 2,
                    borderDash: [4, 4],
                    pointRadius: 0,
                    tension: 0.4,
                },
            ],
        };

        return chartData;
    }, [historicalData, forecastData]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 2000,
            easing: 'easeInOutQuart',
        },
        plugins: {
            legend: {
                display: true,
                position: "top",
                labels: {
                    color: "#ffffff",
                    font: {
                        size: 13,
                        weight: "700",
                    },
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 20,
                    boxWidth: 14,
                    boxHeight: 14,
                },
            },
            tooltip: {
                backgroundColor: "rgba(15, 23, 42, 0.95)",
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
                        const colors = ["#7c3aed", "#a78bfa", "rgba(167, 139, 250, 0.4)", "rgba(167, 139, 250, 0.4)"];
                        return {
                            borderColor: colors[context.datasetIndex] || "#7c3aed",
                            backgroundColor: colors[context.datasetIndex] || "#7c3aed",
                            borderWidth: 3,
                            borderRadius: 2,
                        };
                    },
                    label: function(context) {
                        if (context.parsed.y === null) return '';
                        return `${context.dataset.label}: ৳${context.parsed.y.toFixed(2)}`;
                    },
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
                    color: "#e9e5f0",
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
    };

    return (
        <div className="modern-card p-4 sm:p-6 fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
                <div>
                    <h2 className="text-base sm:text-lg font-bold text-white mb-2 tracking-tight">
                        AI Predictive Analytics
                    </h2>
                    <p className="text-xs sm:text-sm text-[#e9e5f0] font-medium leading-relaxed">
                        Forecast future sales and get actionable recommendations
                    </p>
                </div>
                <button
                    onClick={generateForecast}
                    disabled={isLoading || !historicalData || historicalData.dates.length === 0}
                    className="btn-modern btn-primary whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base px-4 sm:px-6"
                    title={!historicalData || historicalData.dates.length === 0 ? "Add transaction data to generate forecasts" : ""}
                >
                    {isLoading ? "Generating..." : "Generate Forecast"}
                </button>
            </div>

            {forecastData && forecastChartData ? (
                <div className="mb-4 sm:mb-6">
                    <h3 className="text-xs sm:text-sm font-bold text-white mb-3 sm:mb-4 tracking-wide uppercase">
                        Revenue Forecast (Next 14 Days)
                    </h3>
                    <div className="chart-container">
                        <Line data={forecastChartData} options={chartOptions} />
                    </div>
                </div>
            ) : null}

            {anomalies.length > 0 && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-[#a78bfa]/10 border border-[#a78bfa]/30 rounded-lg">
                    <h3 className="text-xs sm:text-sm font-bold text-[#a78bfa] mb-2 tracking-wide uppercase">
                        Anomaly Detection
                    </h3>
                    <p className="text-xs sm:text-sm text-[#e9e5f0] mb-3 font-medium">
                        {anomalies.length} unusual pattern{anomalies.length > 1 ? "s" : ""} detected
                    </p>
                    <div className="space-y-2">
                        {anomalies.slice(0, 3).map((anomaly, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs sm:text-sm">
                                <span className="text-[#e9e5f0]">{anomaly.date}</span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    anomaly.type === "spike" 
                                        ? "bg-[#a78bfa]/20 text-[#a78bfa] border border-[#a78bfa]/30" 
                                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                                }`}>
                                    {anomaly.type === "spike" ? "↑ Spike" : "↓ Drop"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {recommendations.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-xs sm:text-sm font-bold text-white mb-3 sm:mb-4 tracking-wide uppercase">
                        AI Recommendations
                    </h3>
                    {recommendations.map((rec, idx) => (
                        <div
                            key={idx}
                            className={`p-4 rounded-lg border ${
                                rec.priority === "high"
                                        ? "bg-[#4c1d95]/30 border-[#7c3aed]/40"
                                    : "bg-[#7c3aed]/10 border-[#7c3aed]/30"
                            }`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                    rec.type === "inventory"
                                        ? "bg-[#a78bfa]/20 text-[#a78bfa] border border-[#a78bfa]/30"
                                        : rec.type === "cashflow"
                                        ? "bg-[#7c3aed]/20 text-[#7c3aed] border border-[#7c3aed]/30"
                                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                                }`}>
                                    {rec.type.toUpperCase()}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded font-medium ${
                                    rec.priority === "high"
                                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                        : "bg-[#7c3aed]/20 text-[#7c3aed] border border-[#7c3aed]/30"
                                }`}>
                                    {rec.priority.toUpperCase()} PRIORITY
                                </span>
                            </div>
                            <p className="text-sm text-[#e9e5f0] mb-2 font-normal leading-relaxed">{rec.message}</p>
                            <p className="text-sm font-semibold text-white tracking-tight">→ {rec.action}</p>
                        </div>
                    ))}
                </div>
            )}

            {!forecastData && !isLoading && (
                <div className="text-center py-8 sm:py-12 text-[#e9e5f0]">
                    <div className="text-3xl sm:text-4xl mb-3">📈</div>
                    <p className="text-xs sm:text-sm font-bold mb-2 text-white tracking-tight">Ready to predict the future?</p>
                    <p className="text-xs text-[#e9e5f0] font-medium mb-3 px-4">
                        Click "Generate Forecast" to get AI-powered sales predictions
                    </p>
                    {historicalData && historicalData.dates.length > 0 && (
                        <p className="text-xs text-[#a78bfa] font-medium">
                            {historicalData.dates.length} day{historicalData.dates.length !== 1 ? 's' : ''} of data available
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export default PredictiveAnalytics;