/** Parse CSV / tab-separated bulk user upload rows */

export interface BulkUserRow {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

const HEADER_ALIASES: Record<string, keyof BulkUserRow> = {
  email: 'email',
  'e-mail': 'email',
  'first name': 'firstName',
  firstname: 'firstName',
  first: 'firstName',
  'last name': 'lastName',
  lastname: 'lastName',
  last: 'lastName',
  role: 'role',
};

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  result.push(current.trim());
  return result;
}

function normalizeRole(raw: string): string {
  const upper = raw.trim().toUpperCase().replace(/\s+/g, '_');
  if (upper.includes('ADMIN') || upper.includes('OWNER')) return 'ADMIN';
  if (upper.includes('INSTRUCT') || upper.includes('TEACHER')) return 'INSTRUCTOR';
  return 'STUDENT';
}

/**
 * Parse CSV text. Expected headers: email, first name, last name, role (flexible).
 * For .xlsx files, convert to CSV in Excel/Sheets before upload (xlsx binary parse is not bundled).
 */
export function parseUserCsv(text: string): BulkUserRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/"/g, ''));
  const colMap = headers.map((h) => HEADER_ALIASES[h] ?? null);

  const rows: BulkUserRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]);
    if (cells.every((c) => !c)) continue;

    const row: Partial<BulkUserRow> = {};
    colMap.forEach((key, idx) => {
      if (key && cells[idx]) row[key] = cells[idx].replace(/"/g, '');
    });

    if (!row.email) continue;
    rows.push({
      email: row.email,
      firstName: row.firstName ?? row.email.split('@')[0] ?? 'User',
      lastName: row.lastName ?? '',
      role: normalizeRole(row.role ?? 'STUDENT'),
    });
  }
  return rows;
}

export async function parseUserUploadFile(file: File): Promise<BulkUserRow[]> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    throw new Error(
      'Save your spreadsheet as CSV (.csv) and upload again. Columns: email, first name, last name, role.',
    );
  }
  const text = await file.text();
  return parseUserCsv(text);
}
