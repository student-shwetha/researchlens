import { readFile } from 'node:fs/promises';
import { getPool } from '../lib/db.js';

const migrationUrl = new URL('../sql/11_matrix_abstract_coverage.sql', import.meta.url);
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
  const [coverage] = await getPool().query(
    `SELECT field_key, origin, COUNT(*) AS records
       FROM paper_extraction
      GROUP BY field_key, origin
      ORDER BY field_key, origin`
  );
  console.log('Matrix coverage updated:');
  for (const row of coverage) {
    console.log(`  ${row.field_key.padEnd(12)} ${row.origin.padEnd(12)} ${row.records}`);
  }
} catch (error) {
  console.error('Could not update matrix coverage:', error.message);
  process.exitCode = 1;
} finally {
  await getPool().end();
}
