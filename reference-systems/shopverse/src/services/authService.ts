import { query } from '../db/client.js';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  full_name: string;
  created_at: Date;
}

export async function registerUser(
  email: string,
  passwordHash: string,
  fullName: string
): Promise<User> {
  const sql = `
    INSERT INTO users (email, password_hash, full_name)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const res = await query<User>(sql, [email, passwordHash, fullName]);
  return res.rows[0];
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const sql = 'SELECT * FROM users WHERE email = $1';
  const res = await query<User>(sql, [email]);
  return res.rows[0] || null;
}
