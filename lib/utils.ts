/**
 * Joins truthy class name fragments into a single string.
 * A lightweight helper until a styling utility (e.g. clsx/tailwind-merge)
 * is introduced.
 */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}
