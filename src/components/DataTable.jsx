import React from "react";

function DataTable({ data, activeIndex, onRowClick }) {
    const handleRowClickInternal = (index) => {
        onRowClick(index, data);
    };

    const renderRow = (dataItem, index) => {
        const isReceipt = dataItem.Source === "Receipt";
        const isActive = index === activeIndex;

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

        const rowClass = `
            cursor-pointer transition-colors duration-150
            ${isActive ? "bg-[#7c3aed]/20 border-l-4 border-[#7c3aed]" : ""}
        `;

        return (
            <tr
                key={dataItem.id || index}
                className={rowClass}
                onClick={() => handleRowClickInternal(index)}
            >
                <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isReceipt 
                            ? "bg-[#7c3aed]/20 text-[#7c3aed] border border-[#7c3aed]/30" 
                            : "bg-[#a78bfa]/20 text-[#a78bfa] border border-[#a78bfa]/30"
                    }`}>
                        {dataItem.Source}
                    </span>
                </td>
                <td className="px-4 py-3 text-sm text-white font-semibold">
                    {primaryIdentifier}
                </td>
                <td className="px-4 py-3 text-sm text-[#e9e5f0] font-normal">
                    {productInfo}
                </td>
                <td className="px-4 py-3 text-sm text-white font-bold">
                    {priceTotal}
                </td>
                <td className="px-4 py-3 text-sm text-[#e9e5f0] font-normal">
                    {isReceipt ? dataItem.date : dataItem.buying_date}
                </td>
                <td className="px-4 py-3 text-sm text-[#e9e5f0] font-normal">
                    {isReceipt ? "N/A" : dataItem.selling_date}
                </td>
                <td className="px-4 py-3 text-sm text-[#e9e5f0] font-medium">
                    {dateDiff}
                </td>
            </tr>
        );
    };

    return (
        <div className="modern-card overflow-hidden fade-in">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#7c3aed]/20 bg-[#1a1625]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                    <div>
                        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                            Transaction Data
                        </h2>
                        <p className="text-xs sm:text-sm text-[#e9e5f0] mt-1 sm:mt-1.5 font-medium">
                            Click a row to view details
                        </p>
                    </div>
                    <div className="text-xs sm:text-sm text-[#e9e5f0] font-semibold">
                        {data.length} record{data.length !== 1 ? "s" : ""}
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="modern-table">
                    <thead>
                        <tr>
                            <th>Source</th>
                            <th>User/Merchant</th>
                            <th>Product/Items</th>
                            <th>Price/Total</th>
                            <th>Buy Date</th>
                            <th>Sell Date</th>
                            <th>Date Diff (Days)</th>
                        </tr>
                    </thead>
                    <tbody>{data.map(renderRow)}</tbody>
                </table>
            </div>
        </div>
    );
}

export default DataTable;