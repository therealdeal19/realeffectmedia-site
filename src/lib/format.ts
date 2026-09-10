// Post dates are calendar dates (YYYY-MM-DD), so format them in UTC to avoid
// showing the previous day in US time zones.
const fmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

export const formatDate = (d: Date | string) => fmt.format(new Date(d));
