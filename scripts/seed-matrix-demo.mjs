import { readFile } from 'node:fs/promises';
import { getPool } from '../lib/db.js';

const migrationUrl = new URL('../sql/12_matrix_synthetic_demo_values.sql', import.meta.url);
const sql = await readFile(migrationUrl, 'utf8');
const statements = sql
  .replace(/^\s*--.*$/gm, '')
  .split(';')
  .map((statement) => statement.trim())
  .filter(Boolean);

try {
  for (const statement of statements) {
    await getPool().query(statement);
  }
  const [rows] = await getPool().query(
    `SELECT field_key, COUNT(*) AS records
       FROM paper_extraction
      WHERE origin = 'demo'
      GROUP BY field_key
      ORDER BY field_key`
  );
  console.log('Synthetic demo values applied. They are not paper-reported findings:');
  for (const row of rows) {
    console.log(`  ${row.field_key.padEnd(12)} ${row.records}`);
  }
} catch (error) {
  console.error('Could not seed matrix demo values:', error.message);
  process.exitCode = 1;
} finally {
  await getPool().end();
}
