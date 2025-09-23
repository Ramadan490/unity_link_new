// utils/formatDate.ts
import i18n from "@/shared/utils/i18n";

/**
 * Format a date according to the current app language.
 * @param date string | number | Date
 * @param options Intl.DateTimeFormatOptions (optional)
 */
export const formatDate = (
  date: string | number | Date,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  },
): string => {
  try {
    return new Date(date).toLocaleDateString(i18n.language, options);
  } catch (err) {
    console.warn("❌ formatDate failed:", err);
    return String(date); // fallback if invalid date
  }
};

/**
 * Format a relative time (e.g. "3 days ago", "in 2 hours").
 * Uses Intl.RelativeTimeFormat with the current language.
 * @param date string | number | Date
 */
export const formatRelativeDate = (date: string | number | Date): string => {
  try {
    const targetDate = new Date(date).getTime();
    const now = Date.now();
    const diff = targetDate - now;

    const seconds = Math.round(diff / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    const rtf = new Intl.RelativeTimeFormat(i18n.language, { numeric: "auto" });

    if (Math.abs(seconds) < 60) return rtf.format(seconds, "second");
    if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
    if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
    return rtf.format(days, "day");
  } catch (err) {
    console.warn("❌ formatRelativeDate failed:", err);
    return String(date);
  }
};
