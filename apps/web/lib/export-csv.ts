/** Trigger browser download of CSV content */

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportUsersCsv(
  rows: Array<{ name: string; email: string; status: string; role: string; group?: string }>,
): string {
  const header = 'User,Email,Status,Role,Group';
  const lines = rows.map((r) => `"${r.name}","${r.email}","${r.status}","${r.role}","${r.group ?? ''}"`);
  return [header, ...lines].join('\n');
}
