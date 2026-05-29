/**
 * Parses date from server which can be a string/ISO or an array format
 * like [year, month, day, hour, minute, second, nanoseconds]
 */
export function parseServerDate(date: unknown): Date {
  if (!date) return new Date();

  if (Array.isArray(date)) {
    // Jackson serialization: [year, month, day, hour, minute, second, nano]
    // Month is 1-based in server, 0-based in JS Date
    const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = date as number[];

    return new Date(
      year,
      month - 1,
      day,
      hour,
      minute,
      second,
      Math.floor(nano / 1000000),
    );
  }

  if (typeof date === "string" || typeof date === "number") {
    const d = new Date(date);
    return isNaN(d.getTime()) ? new Date() : d;
  }

  if (date instanceof Date) {
    return date;
  }

  return new Date();
}

/**
 * Formats a server date to localized string
 */
export function formatServerDate(
  date: unknown,
  format: "date" | "datetime" = "date",
): string {
  const d = parseServerDate(date);
  if (format === "datetime") {
    return d.toLocaleString("vi-VN");
  }
  return d.toLocaleDateString("vi-VN");
}
