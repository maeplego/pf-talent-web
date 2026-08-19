export function calendarPublicWebBase(): string {
  return (process.env.CALENDAR_PUBLIC_WEB_URL ?? "http://localhost:3005").replace(/\/$/, "");
}

export function upcomingSlotRange(): { rangeStart: string; rangeEnd: string } {
  const start = new Date();
  start.setUTCDate(start.getUTCDate() + 1);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 5);
  return { rangeStart: start.toISOString(), rangeEnd: end.toISOString() };
}
