import pg, { type PoolClient, type QueryResult, type QueryResultRow } from 'pg';

const { Pool } = pg;

export interface DatabaseConfig {
  connectionString?: string;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

let pool: pg.Pool | null = null;

export function getDatabasePool(config?: DatabaseConfig): pg.Pool {
  if (!pool) {
    const connectionString =
      config?.connectionString ||
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/engineering_simulator?schema=public';

    pool = new Pool({
      connectionString,
      max: config?.max ?? 20,
      idleTimeoutMillis: config?.idleTimeoutMillis ?? 30000,
      connectionTimeoutMillis: config?.connectionTimeoutMillis ?? 5000,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client:', err);
    });
  }

  return pool;
}

export async function query<R extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<R>> {
  const activePool = getDatabasePool();
  return activePool.query<R>(text, params);
}

export async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const activePool = getDatabasePool();
  const client = await activePool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
