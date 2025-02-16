import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRandomProfileImage() {
  const randomId = Math.floor(Math.random() * 1000)
  return `https://picsum.photos/id/${randomId}/info`
}

