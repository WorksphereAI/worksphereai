import React from 'react';

interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
}

export function ResponsiveTable<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
}: ResponsiveTableProps<T>) {
  return (
    <div className="w-full overflow-auto -mx-4 sm:mx-0">
      {/* Mobile Card View (below sm) */}
      <div className="block sm:hidden space-y-3 px-4">
        {data.map((item, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onRowClick?.(item)}
          >
            {columns
              .filter(col => !col.hideOnMobile)
              .map((col) => (
                <div key={String(col.key)} className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{col.header}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {col.render
                      ? col.render(item[col.key], item)
                      : item[col.key]}
                  </span>
                </div>
              ))}
          </div>
        ))}
      </div>

      {/* Tablet/Desktop Table View (sm and above) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`
                    px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                    ${col.hideOnTablet ? 'hidden lg:table-cell' : ''}
                  `}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr
                key={index}
                className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={`
                      px-6 py-4 whitespace-nowrap text-sm text-gray-900
                      ${col.hideOnTablet ? 'hidden lg:table-cell' : ''}
                    `}
                  >
                    {col.render
                      ? col.render(item[col.key], item)
                      : item[col.key]}
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
