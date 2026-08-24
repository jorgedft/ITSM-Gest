export function Table({ columns, data, onRowClick }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        {columns.map((col, i) => (
                            <th key={i} className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => (
                        <tr
                            key={row.id ?? i}
                            onClick={() => onRowClick?.(row)}
                            className={`border-b border-gray-50 transition-colors
                                ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : 'hover:bg-gray-50'}`}
                        >
                            {columns.map((col, j) => (
                                <td key={j} className="px-4 py-3 text-gray-700">
                                    {col.render ? col.render(row) : row[col.accessor]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}