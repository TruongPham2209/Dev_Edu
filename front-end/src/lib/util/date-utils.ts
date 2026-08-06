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

/**
 * Formats a date or datetime-local input string into a local ISO string (YYYY-MM-DDTHH:mm:ss)
 * WITHOUT converting to UTC (preserving wall-clock time for Spring Boot LocalDateTime).
 */
export function toLocalIsoString(
  dateInput: string | Date | null | undefined,
): string {
  if (!dateInput) return "";

  if (typeof dateInput === "string") {
    const trimmed = dateInput.trim();
    if (!trimmed) return "";
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
      return `${trimmed}:00`;
    }
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    const d = new Date(trimmed);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) return "";
    const year = dateInput.getFullYear();
    const month = String(dateInput.getMonth() + 1).padStart(2, "0");
    const day = String(dateInput.getDate()).padStart(2, "0");
    const hours = String(dateInput.getHours()).padStart(2, "0");
    const minutes = String(dateInput.getMinutes()).padStart(2, "0");
    const seconds = String(dateInput.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  return "";
}
