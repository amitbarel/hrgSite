import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// מחבר שמות של classes, ומבטל כפילויות של Tailwind (למשל p-4 ו-p-6: נשאר האחרון)
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
