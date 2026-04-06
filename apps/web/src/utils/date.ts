function parseToDate(dateStr: string): Date | null {
  let year: number | null = null;
  let month: number | null = null;

  if (dateStr.match(/^\d{4}-\d{2}$/)) {
    const parts = dateStr.split("-");
    year = Number.parseInt(parts[0], 10);
    month = Number.parseInt(parts[1], 10);
  } else if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const parts = dateStr.split("-");
    year = Number.parseInt(parts[0], 10);
    month = Number.parseInt(parts[1], 10);
  } else if (dateStr.match(/^\d{4}\.\d{2}$/)) {
    const parts = dateStr.split(".");
    year = Number.parseInt(parts[0], 10);
    month = Number.parseInt(parts[1], 10);
  } else if (dateStr.match(/^\d{4}\/\d{2}$/)) {
    const parts = dateStr.split("/");
    year = Number.parseInt(parts[0], 10);
    month = Number.parseInt(parts[1], 10);
  }

  if (year !== null && month !== null) {
    return new Date(Date.UTC(year, month - 1, 1));
  }

  return null;
}

export function formatDateString(
  dateStr: string | undefined,
  locale: string = "zh"
): string {
  if (!dateStr) return "";

  if (dateStr.includes(" - ")) {
    const [start, end] = dateStr.split(" - ");
    return `${formatDateString(start, locale)} - ${formatDateString(end, locale)}`;
  }

  const date = parseToDate(dateStr);
  if (!date) return dateStr;

  try {
    if (locale === "zh" || locale === "zh-CN") {
      return `${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    }

    const formatter = new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "2-digit",
      timeZone: "UTC",
    });
    return formatter.format(date);
  } catch {
    return dateStr;
  }
}
