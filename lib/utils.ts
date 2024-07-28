import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const secondsToHHMMSS = (secs: number, skipHour = true) => {
  const hours = Math.floor(secs / 3600) % 24
  const minutes = Math.floor(secs / 60) % 60
  const seconds = secs % 60

  return [hours, minutes, seconds]
    .map((v, i) => {
      if (i === 2) {
        v = Math.floor(v)
      }
      return (v < 10 ? "0" + v : v)
    })
    .filter((v, i) => skipHour ? (v !== "00" || i > 0) : true)
    .join(":")
}

export const secondsToHHMMSSWithoutZeroPadding = (secs: number) => {
  const hours = Math.floor(secs / 3600) % 24
  const minutes = Math.floor(secs / 60) % 60
  const seconds = secs % 60

  if (secs < 60) {
    return `${seconds}`
  } else if (secs < 3600) {
    return [minutes, seconds]
      .map((v) => (v < 10 ? "0" + v : v))
      .filter((v, i) => v !== "00" || i > 0)
      .join(":")
  }

  return [hours, minutes, seconds]
    .map((v) => (v < 10 ? "0" + v : v))
    .filter((v, i) => v !== "00" || i > 0)
    .join(":")
}

export const wait = async (milliSeconds: number) => {
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, milliSeconds);
  });
};