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

export function formatServerDate(
  date: unknown,
  format: "date" | "datetime" = "date",
): string {
  const d = parseServerDate(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  if (format === "datetime") {
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }
  return `${day}/${month}/${year}`;
}

/**
 * Formats a number to Vietnamese currency format without depending on locale settings,
 * preventing hydration mismatches.
 */
export function formatPrice(price: number): string {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
