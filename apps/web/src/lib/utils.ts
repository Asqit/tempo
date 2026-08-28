import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a consistent hash from a string
 */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Generate consistent HSL colors from a string (e.g., name)
 * Returns background and foreground colors that persist for the same input
 */
export function generateColorFromString(str: string) {
  const hash = hashString(str.toLowerCase());

  // Generate hue (0-360)
  const hue = hash % 360;

  // Use lower saturation for softer colors
  const saturation = 40 + (hash % 15); // 40-55%
  const lightness = 50 + (hash % 15); // 50-65%

  return {
    bg: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    fg: lightness > 57 ? "#000000" : "#FFFFFF", // Dark text for light bg, light text for dark bg
  };
}
