import mysql, {
  type ExecuteValues,
  type Pool,
  type PoolConnection,
  type ResultSetHeader,
  type RowDataPacket,
} from "mysql2/promise";
import { loadDbEnv } from "@/env";

let poolInstance: Pool | null = null;

function createPool() {
  const env = loadDbEnv();
  return mysql.createPool({
    host: env.MYSQL_HOST,
    port: env.MYSQL_PORT,
    user: env.MYSQL_USER,
    password: env.MYSQL_PASSWORD,
    database: env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: env.MYSQL_CONNECTION_LIMIT,
    queueLimit: 0,
    enableKeepAlive: true,
  });
}

function getPool() {
  poolInstance ??= createPool();
  return poolInstance;
}

export const pool: Pool = new Proxy({} as Pool, {
  get(_target, property, receiver) {
    const value = Reflect.get(getPool(), property, receiver);
    return typeof value === "function" ? value.bind(getPool()) : value;
  },
});

export async function query<T extends RowDataPacket[] | ResultSetHeader>(
  sql: string,
  params: unknown[] = [],
): Promise<T> {
  const [rows] = await pool.query<T>(sql, params as ExecuteValues[]);
  return rows;
}

export async function execute<T extends RowDataPacket[] | ResultSetHeader>(
  sql: string,
  params: unknown[] = [],
): Promise<T> {
  const [rows] = await pool.execute<T>(sql, params as ExecuteValues[]);
  return rows;
}

export async function getOne<T extends RowDataPacket>(
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await execute<T[]>(sql, params);
  return rows[0] ?? null;
}

export async function getAll<T extends RowDataPacket>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  return query<T[]>(sql, params);
}

export async function transaction<T>(
  callback: (connection: PoolConnection) => Promise<T>,
): Promise<T> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function testConnection(): Promise<boolean> {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    return true;
  } finally {
    connection.release();
  }
}
