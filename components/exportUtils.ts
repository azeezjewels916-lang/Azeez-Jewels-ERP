/**
 * Export to Excel (CSV) Utility
 * Generates UTF-8 BOM encoded CSV files compatible with Microsoft Excel, Google Sheets, etc.
 */

export const exportToExcel = (data: any[], filename: string, customHeaders?: Record<string, string>) => {
  if (!data || data.length === 0) {
    alert('No data available to export.');
    return;
  }

  const keys = Object.keys(data[0]);
  const headerRow = keys.map(k => {
    const label = customHeaders?.[k] || k;
    return `"${String(label).replace(/"/g, '""')}"`;
  }).join(',');

  const rows = data.map(row => {
    return keys.map(k => {
      let val = row[k];
      if (val === null || val === undefined) val = '';
      if (typeof val === 'object') val = JSON.stringify(val);
      const strVal = String(val).replace(/"/g, '""');
      return `"${strVal}"`;
    }).join(',');
  });

  const csvContent = '\uFEFF' + [headerRow, ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
