export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export function parseJson<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value !== "string") return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function parseJsonArray<T = unknown>(value: unknown): T[] {
  return parseJson<T[]>(value, []);
}

export function parseJsonObject<T extends Record<string, unknown> = Record<string, unknown>>(
  value: unknown,
): T {
  return parseJson<T>(value, {} as T);
}
