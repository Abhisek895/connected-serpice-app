"use client";

// Remove unused imports

interface Column {
  key: string;
  header: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (item: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  keyField?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onRowClick?: (item: any) => void;
  isLoading?: boolean;
  emptyStateMessage?: string;
}

export default function DataTable({ 
  columns, 
  data, 
  keyField = "id", 
  onRowClick,
  isLoading = false,
  emptyStateMessage = "No records found"
}: DataTableProps) {
  
  if (isLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center border border-slate-800 rounded-xl bg-[#111827]">
        <div className="text-slate-500 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-48 flex items-center justify-center border border-slate-800 rounded-xl bg-[#111827]">
        <div className="text-slate-500 text-sm">{emptyStateMessage}</div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden border border-slate-800 rounded-xl bg-[#111827]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase bg-[#0f172a] border-b border-slate-800">
            <tr>
              {columns.map((col) => (
                <th key={col.key} scope="col" className="px-6 py-4 font-semibold tracking-wider">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, rowIndex) => (
              <tr 
                key={item[keyField] || rowIndex} 
                onClick={() => onRowClick?.(item)}
                className={`border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col) => (
                  <td key={`${item[keyField] || rowIndex}-${col.key}`} className="px-6 py-4 text-slate-300">
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
