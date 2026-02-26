import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Set the user's country preference cookie (client-side) */
export function setCountryCookie(code: string) {
  if (typeof document !== "undefined") {
    document.cookie = `condor_country=${code};path=/;max-age=31536000;samesite=lax`;
  }
}
