import { type ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: string;
  align?: 'left' | 'right' | 'center';
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

const alignCls: Record<string, string> = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
};

export function DataTable<T>({ columns, data, rowKey, onRowClick, emptyMessage = 'No data available' }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-[#0f1629]/80">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`${alignCls[col.align ?? 'left']} py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/6">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-sm text-slate-400 dark:text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`hover:bg-slate-50 dark:hover:bg-white/3 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`py-3 px-4 text-sm ${alignCls[col.align ?? 'left']} ${col.className ?? ''}`}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
