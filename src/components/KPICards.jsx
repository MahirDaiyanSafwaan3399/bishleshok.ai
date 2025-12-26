import React, { useMemo } from "react";

function KPICards({ data }) {
    const metrics = useMemo(() => {
        let totalRevenue = 0;
        let totalItems = 0;
        let totalTransactions = data.length;
        let avgTransactionValue = 0;
        const productCount = new Set();

        data.forEach((item) => {
            if (item.Source === "Receipt") {
                totalRevenue += item.total_amount || 0;
                if (item.line_items) {
                    item.line_items.forEach((line) => {
                        totalItems += line.quantity || 0;
                        productCount.add(line.description);
                    });
                }
            } else if (item.Source === "Voice") {
                totalRevenue +=
                    (item.product_price || 0) * (item.amount_purchased || 0);
                totalItems += item.amount_purchased || 0;
                productCount.add(item.product_name);
            }
        });

        avgTransactionValue =
            totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

        return {
            totalRevenue,
            totalItems,
            totalTransactions,
            avgTransactionValue,
            uniqueProducts: productCount.size,
        };
    }, [data]);

    const kpiCards = [
        {
            label: "Total Revenue",
            value: `৳${metrics.totalRevenue.toLocaleString("en-BD", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}`,
            icon: "💰",
            gradient: "from-[#7c3aed] to-[#a78bfa]",
            borderGradient: "border-[#7c3aed]/50",
            bgGradient: "bg-[#7c3aed]/10",
        },
        {
            label: "Total Items",
            value: metrics.totalItems.toLocaleString("en-BD"),
            icon: "📦",
            gradient: "from-[#8b5cf6] to-[#c4b5fd]",
            borderGradient: "border-[#8b5cf6]/50",
            bgGradient: "bg-[#8b5cf6]/10",
        },
        {
            label: "Transactions",
            value: metrics.totalTransactions,
            icon: "🔄",
            gradient: "from-[#4c1d95] to-[#7c3aed]",
            borderGradient: "border-[#4c1d95]/50",
            bgGradient: "bg-[#4c1d95]/10",
        },
        {
            label: "Avg Transaction",
            value: `৳${metrics.avgTransactionValue.toLocaleString("en-BD", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}`,
            icon: "📊",
            gradient: "from-[#a78bfa] to-[#7c3aed]",
            borderGradient: "border-[#a78bfa]/50",
            bgGradient: "bg-[#a78bfa]/10",
        },
        {
            label: "Unique Products",
            value: metrics.uniqueProducts,
            icon: "✨",
            gradient: "from-[#7c3aed] to-[#8b5cf6]",
            borderGradient: "border-[#7c3aed]/50",
            bgGradient: "bg-[#7c3aed]/10",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {kpiCards.map((kpi, index) => (
                <div
                    key={kpi.label}
                    className={`modern-card p-4 sm:p-5 border-2 ${kpi.borderGradient} fade-in`}
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div
                            className={`${kpi.bgGradient} p-2 sm:p-3 rounded-xl backdrop-blur-sm`}
                        >
                            <span className="text-xl sm:text-2xl">{kpi.icon}</span>
                        </div>
                        <div
                            className={`h-1 w-8 sm:w-12 rounded-full bg-gradient-to-r ${kpi.gradient}`}
                        ></div>
                    </div>
                    <h3 className="text-xs font-bold text-[#e9e5f0] uppercase tracking-widest mb-2 sm:mb-3 leading-tight">
                        {kpi.label}
                    </h3>
                    <p
                        className={`text-xl sm:text-2xl lg:text-3xl font-extrabold bg-gradient-to-r ${kpi.gradient} bg-clip-text text-transparent tracking-tight break-words`}
                    >
                        {kpi.value}
                    </p>
                </div>
            ))}
        </div>
    );
}

export default KPICards;
