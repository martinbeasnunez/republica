/**
 * Normalize verdict string from AI response.
 * Handles accents (ENGAÑOSO → ENGANOSO), casing, and unexpected values.
 */
const VALID_VERDICTS = [
  "VERDADERO",
  "PARCIALMENTE_VERDADERO",
  "ENGANOSO",
  "FALSO",
  "NO_VERIFICABLE",
] as const;

export type Verdict = (typeof VALID_VERDICTS)[number];

export function normalizeVerdict(raw: string): Verdict {
  if (!raw) return "NO_VERIFICABLE";

  // Normalize: remove accents/tildes, uppercase, trim
  const normalized = raw
    .toUpperCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/\s+/g, "_");

  // Map known variations
  if (normalized === "VERDADERO" || normalized === "TRUE") return "VERDADERO";
  if (normalized === "PARCIALMENTE_VERDADERO" || normalized.includes("PARCIAL")) return "PARCIALMENTE_VERDADERO";
  if (normalized === "ENGANOSO" || normalized.includes("ENGANO")) return "ENGANOSO";
  if (normalized === "FALSO" || normalized === "FALSE") return "FALSO";
  if (normalized === "NO_VERIFICABLE" || normalized.includes("NO_VERIF") || normalized.includes("INDETERMINAD")) return "NO_VERIFICABLE";

  // Check if it's already valid
  if (VALID_VERDICTS.includes(normalized as Verdict)) {
    return normalized as Verdict;
  }

  // Default: if we can't classify, it's not verifiable
  return "NO_VERIFICABLE";
}
