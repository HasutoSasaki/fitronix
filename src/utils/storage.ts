/**
 * Storage utility functions
 * Shared helpers for storage layer implementations
 */

/**
 * Generate UUID v4
 * @returns UUID v4 string (e.g., "a1b2c3d4-e5f6-4789-a012-b3c4d5e6f789")
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get current timestamp in ISO 8601 format
 * @returns ISO 8601 timestamp string (e.g., "2025-12-05T12:00:00.000Z")
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Ensure a new timestamp is different from an old one
 * If they're the same millisecond, adds 1ms to guarantee difference
 *
 * @param oldTimestamp - Previous timestamp to compare against
 * @returns New timestamp guaranteed to be different
 */
export function getUpdatedTimestamp(oldTimestamp: string): string {
  const newTimestamp = getCurrentTimestamp();

  if (newTimestamp === oldTimestamp) {
    const date = new Date();
    date.setMilliseconds(date.getMilliseconds() + 1);
    return date.toISOString();
  }

  return newTimestamp;
}

/**
 * Validate if a string is a valid UUID v4
 * @param value - Value to check
 * @returns True if valid UUID v4
 */
export function isValidUUID(value: string): boolean {
  const uuidv4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidv4Regex.test(value);
}

/**
 * Validate if a string is a valid ISO 8601 timestamp
 * @param value - Value to check
 * @returns True if valid ISO 8601 timestamp
 */
export function isValidTimestamp(value: string): boolean {
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
  return iso8601Regex.test(value);
}
