export type DurationStyle = "clock" | "dashboard" | "short" | "spaced";

export function durationSecondsBetween(
  startTime: string | Date,
  endTime?: string | Date | null,
  now = Date.now(),
) {
  const start = new Date(startTime).getTime();
  const end = endTime ? new Date(endTime).getTime() : now;

  if (!Number.isFinite(start) || !Number.isFinite(end)) return 0;
  return Math.max(0, Math.floor((end - start) / 1000));
}

export function durationMinutesBetween(
  startTime: string | Date,
  endTime?: string | Date | null,
  now = Date.now(),
) {
  return Math.floor(durationSecondsBetween(startTime, endTime, now) / 60);
}

export function formatDuration(
  value: number,
  style: DurationStyle = "short",
) {
  if (style === "clock") {
    const totalSeconds = Math.max(0, Math.floor(value));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
      .map((part) => String(part).padStart(2, "0"))
      .join(":");
  }

  const totalMinutes = Math.max(0, Math.floor(value));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (style === "dashboard") {
    return `${String(hours).padStart(2, "0")}h:${String(minutes).padStart(2, "0")}m`;
  }

  if (style === "spaced") {
    if (hours === 0) return `${minutes} min`;
    if (minutes === 0) return `${hours} h`;
    return `${hours} h ${minutes} min`;
  }

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function formatHours(hours: number, spaced = true) {
  const value = hours.toLocaleString("cs-CZ", {
    minimumFractionDigits: hours > 0 && hours < 10 ? 1 : 0,
    maximumFractionDigits: 1,
  });

  return spaced ? `${value} h` : `${value}h`;
}

export function formatHoursFromMinutes(minutes: number, spaced = true) {
  return formatHours(minutes / 60, spaced);
}

export function formatElapsed(totalSeconds: number, padHours = false) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${padHours ? pad(hours) : hours}:${pad(minutes)}:${pad(rest)}`;
}
