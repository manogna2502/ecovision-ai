import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional classNames and resolve Tailwind conflicts.
 * Standard shadcn/ui utility — used by every ui/ primitive.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
