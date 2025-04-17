import type { AnyData, ColumnDef, ExportFormat, ExportOptions } from './types';

export async function exportData<TData extends AnyData>(
  data: TData[],
  columns: ColumnDef<TData>[],
  options: ExportOptions
): Promise<void> {
  const { format, filename = 'export', includeHeaders = true, columns: selectedColumns } = options;

  // Filter columns if specific ones are requested
  const exportColumns = selectedColumns
    ? columns.filter(col => selectedColumns.includes(col.id))
    : columns;

  // Prepare data for export
  const rows = data.map(row => {
    return exportColumns.map(column => {
      if (column.exportValue) {
        return column.exportValue(row);
      }
      return column.accessorFn
        ? column.accessorFn(row)
        : column.accessorKey
        ? row[column.accessorKey]
        : undefined;
    });
  });

  // Add headers if requested
  if (includeHeaders) {
    const headers = exportColumns.map(col => col.header);
    rows.unshift(headers);
  }

  // Create blob based on format
  let blob: Blob;
  let extension: string;

  if (format === 'csv') {
    const csvContent = rows
      .map(row => row.map(cell => {
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        const stringValue = String(cell ?? '');
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(','))
      .join('\n');

    blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    extension = 'csv';
  } else {
    // For XLSX, we'll use a web worker to avoid blocking the UI
    const worker = new Worker(new URL('./exportWorker.ts', import.meta.url));
    
    return new Promise<void>((resolve, reject) => {
      worker.onmessage = (event) => {
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          const arrayBuffer = event.data.buffer;
          blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          extension = 'xlsx';
          downloadFile(blob, `${filename}.${extension}`);
          worker.terminate();
          resolve();
        }
      };

      worker.onerror = (error) => {
        worker.terminate();
        reject(error);
      };

      worker.postMessage({ rows });
    });
  }

  downloadFile(blob, `${filename}.${extension}`);
}

function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
} 