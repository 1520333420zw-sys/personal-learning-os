import type {
  ISODateString,
  ISODateTimeString,
} from "@/domain/common/entity";

const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function toLocalDateKey(date: Date): ISODateString {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return year + "-" + month + "-" + day;
}

export function addLocalDays(
  dateKey: ISODateString,
  numberOfDays: number,
): ISODateString {
  const match = DATE_KEY_PATTERN.exec(dateKey);

  if (!match) {
    throw new Error("Expected a local date in YYYY-MM-DD format.");
  }

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day) + numberOfDays);

  return toLocalDateKey(date);
}

export function toLocalDateTime(
  dateKey: ISODateString,
  hours: number,
  minutes = 0,
): ISODateTimeString {
  const match = DATE_KEY_PATTERN.exec(dateKey);

  if (!match) {
    throw new Error("Expected a local date in YYYY-MM-DD format.");
  }

  const [, year, month, day] = match;

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    hours,
    minutes,
  ).toISOString();
}
