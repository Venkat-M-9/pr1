/**
 * Generic CSV exporter utility that generates and triggers browser download for any data array.
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string = 'export.csv',
  columns?: { key: keyof T; label: string }[]
) {
  if (!data || data.length === 0) return;

  const cols =
    columns ||
    Object.keys(data[0]).map(k => ({
      key: k as keyof T,
      label: k.toUpperCase(),
    }));

  const headers = cols.map(c => `"${String(c.label).replace(/"/g, '""')}"`).join(',');

  const rows = data.map(row =>
    cols
      .map(c => {
        const val = row[c.key];
        if (val === null || val === undefined) return '""';
        if (Array.isArray(val)) return `"${val.join('; ').replace(/"/g, '""')}"`;
        if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  const csvContent = [headers, ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generic CSV & JSON file parser utility.
 * Parses raw file content into typed JavaScript objects based on a schema mapping.
 */
export interface FieldSchema<T> {
  key: keyof T;
  label: string;
  type?: 'string' | 'number' | 'boolean' | 'date' | 'array';
  defaultValue?: any;
  transform?: (val: any) => any;
}

export function parseFileData<T>(
  fileContent: string,
  fileName: string,
  schema: FieldSchema<T>[]
): T[] {
  if (fileName.endsWith('.json')) {
    const raw = JSON.parse(fileContent);
    const array = Array.isArray(raw) ? raw : [raw];
    return array.map((item, idx) => mapObjectToSchema(item, schema, idx));
  }

  // Parse CSV lines safely considering quoted commas
  const lines = fileContent.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length <= 1) {
    throw new Error('File is empty or missing headers.');
  }

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^"|"$/g, ''));
    return result;
  };

  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());

  return lines.slice(1).map((line, idx) => {
    const values = parseCSVLine(line);
    const rawObj: Record<string, any> = {};
    headers.forEach((h, i) => {
      rawObj[h] = values[i] !== undefined ? values[i] : '';
    });
    return mapObjectToSchema(rawObj, schema, idx);
  });
}

function mapObjectToSchema<T>(rawObj: any, schema: FieldSchema<T>[], idx: number): T {
  const result: any = {};

  schema.forEach(field => {
    // Look up key case-insensitively or via label
    const targetKey = String(field.key).toLowerCase();
    const targetLabel = field.label.toLowerCase();

    let rawVal =
      rawObj[field.key] ??
      rawObj[targetKey] ??
      rawObj[targetLabel] ??
      undefined;

    if (rawVal === undefined || rawVal === '') {
      rawVal = field.defaultValue !== undefined ? field.defaultValue : '';
    }

    if (field.transform) {
      result[field.key] = field.transform(rawVal);
    } else if (field.type === 'number') {
      const parsedNum = parseFloat(rawVal);
      result[field.key] = isNaN(parsedNum) ? 0 : parsedNum;
    } else if (field.type === 'boolean') {
      result[field.key] = String(rawVal).toLowerCase() === 'true' || rawVal === '1';
    } else if (field.type === 'array') {
      result[field.key] = typeof rawVal === 'string' ? rawVal.split(';').map(s => s.trim()) : [];
    } else {
      result[field.key] = String(rawVal);
    }
  });

  return result as T;
}
