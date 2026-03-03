
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const csvFilePath = path.join(process.cwd(), 'data_dump.csv');
const sqlFilePath = path.join(process.cwd(), 'insert_data.sql');

const csvContent = fs.readFileSync(csvFilePath, 'utf8');

Papa.parse(csvContent, {
  header: true,
  complete: (results) => {
    const rows = results.data;
    if (rows.length === 0) {
      console.log('No data found in CSV.');
      return;
    }

    let sql = '-- SCRIPT DE INSERÇÃO DE DADOS (SUPABASE)\n';
    sql += '-- Copie e cole este código no SQL Editor do seu projeto Supabase e clique em RUN.\n\n';
    sql += 'INSERT INTO public.protocols (id, client_name, updated_at, data)\nVALUES\n';

    const values = rows.map((row: any) => {
      // Skip empty rows
      if (!row.id || !row.client_name) return null;

      const id = `'${row.id.replace(/'/g, "''")}'`;
      const client_name = `'${row.client_name.replace(/'/g, "''")}'`;
      const updated_at = row.updated_at ? `'${row.updated_at}'` : 'now()';
      
      // The 'data' field is already a JSON string in the CSV, but we need to escape it for SQL
      // In CSV it might be double-quoted if it contains quotes. PapaParse handles the CSV unescaping.
      // So row.data is the actual JSON string.
      // We need to escape single quotes for SQL.
      const data = `'${row.data.replace(/'/g, "''")}'`;

      return `  (${id}, ${client_name}, ${updated_at}, ${data})`;
    }).filter(Boolean);

    sql += values.join(',\n') + ';\n';

    fs.writeFileSync(sqlFilePath, sql);
    console.log(`SQL file generated at ${sqlFilePath}`);
  },
  error: (err: any) => {
    console.error('Error parsing CSV:', err);
  }
});
