import { getPool, query } from '../lib/db.js';

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
if (!email || email.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
  console.error('Set ADMIN_EMAIL to the email of an existing, trusted registered account.');
  process.exitCode = 1;
} else {
  try {
    const users = await query('SELECT user_id, role FROM users WHERE email = ?', [email]);
    if (!users.length) {
      throw new Error(`No account found for ${email}. Register that account first.`);
    }
    if (users[0].role !== 'ADMIN') {
      await query('UPDATE users SET role = ? WHERE user_id = ?', ['ADMIN', users[0].user_id]);
    }
    console.log(`${email} is now an ADMIN.`);
  } catch (error) {
    console.error(`Could not promote admin: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await getPool().end();
  }
}
