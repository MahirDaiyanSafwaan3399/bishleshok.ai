import React from "react";

// This is a "presentational" component. It just displays the data it's given.
function DataTable({ data, activeIndex, onRowClick }) {
    const renderRow = (dataItem, index) => {
        const isReceipt = dataItem.Source === "Receipt";

        // Data processing from original file
        let primaryIdentifier = isReceipt
            ? dataItem.merchant_name
            : dataItem.user_name;
        let productInfo = isReceipt
            ? dataItem.line_items
                ? `${dataItem.line_items.length} items`
                : "N/A"
            : dataItem.product_name;
        let priceTotal = isReceipt
            ? `${dataItem.currency || ""} ${dataItem.total_amount}`
            : dataItem.product_price;
        let dateDiff = isReceipt ? "N/A" : dataItem.date_difference_days;

        // --- Dynamic classes for active row ---
        const isActive = index === activeIndex;
        const rowClass = `
            cursor-pointer transition-colors duration-150
            ${isActive ? "bg-indigo-900/30" : "hover:bg-white/5"}
        `;
        const buttonClass = `
            text-xs py-1.5 px-4 rounded-full transition-colors font-medium
            ${
                isActive
                    ? "bg-indigo-500 text-white"
                    : "bg-slate-700 hover:bg-slate-600 text-slate-300"
            }
        `;

        return (
            <tr
                key={dataItem.id || index}
                className={rowClass}
                onClick={() => onRowClick(index)}
            >
                <td className="px-6 py-4 text-sky-300">{dataItem.Source}</td>
                <td className="px-6 py-4 text-gray-200">{primaryIdentifier}</td>
                <td className="px-6 py-4 text-gray-200">{productInfo}</td>
                <td className="px-6 py-4 text-gray-200">{priceTotal}</td>
                <td className="px-6 py-4 text-gray-200">
                    {isReceipt ? dataItem.date : dataItem.buying_date}
                </td>
                <td className="px-6 py-4 text-gray-200">
                    {isReceipt ? "N/A" : dataItem.selling_date}
                </td>
                <td className="px-6 py-4 text-gray-200">{dateDiff}</td>
                <td className="px-6 py-4">
                    <div className="flex justify-center">
                        <button className={buttonClass}>View</button>
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <div
            className="glass-panel overflow-hidden panel-fade-in"
            style={{ animationDelay: "700ms" }}
        >
            <div className="p-8 border-b border-white/10">
                <h2 className="text-2xl font-semibold text-gray-100">
                    Extracted Data Table
                </h2>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr>
                            <th className="py-4 px-6 text-left">Source</th>
                            <th className="py-4 px-6 text-left">
                                User/Merchant
                            </th>
                            <th className="py-4 px-6 text-left">
                                Product/Items
                            </th>
                            <th className="py-4 px-6 text-left">Price/Total</th>
                            <th className="py-4 px-6 text-left">Buy Date</th>
                            <th className="py-4 px-6 text-left">Sell Date</th>
                            <th className="py-4 px-6 text-left">
                                Date Diff (Days)
                            </th>
                            <th className="py-4 px-6 text-center">Details</th>
                        </tr>
                    </thead>
                    <tbody id="data-table-body">{data.map(renderRow)}</tbody>
                </table>
            </div>
        </div>
    );
}

export default DataTable;
