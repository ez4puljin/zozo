import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMNT(amount: number): string {
  return new Intl.NumberFormat("mn-MN").format(amount) + " ₮";
}

export function formatPhone(phone: string): string {
  // 99112233 → 9911-2233
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 8) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return phone;
}

export function formatDate(d: Date | number | string): string {
  const date = typeof d === "object" ? d : new Date(d);
  return new Intl.DateTimeFormat("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ulaanbaatar",
  }).format(date);
}

export function slugify(input: string): string {
  // Cyrillic-to-Latin transliteration
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "ye", ё: "yo",
    ж: "j", з: "z", и: "i", й: "i", к: "k", л: "l", м: "m",
    н: "n", о: "o", ө: "u", п: "p", р: "r", с: "s", т: "t",
    у: "u", ү: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh",
    щ: "sh", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };
  return input
    .toLowerCase()
    .split("")
    .map((c) => map[c] ?? c)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function newId(): string {
  return crypto.randomUUID();
}
