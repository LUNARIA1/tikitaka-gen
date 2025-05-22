/**
 * Parses a @font-face CSS rule to extract the font-family name.
 * @param rule The full @font-face rule as a string.
 * @returns The extracted font-family name, or null if not found.
 */
export const parseFontFamilyName = (rule: string): string | null => {
  if (!rule || typeof rule !== 'string') {
    return null;
  }
  // Regex to find font-family: 'Font Name' or font-family: "Font Name" or font-family: FontName
  // It handles optional quotes and leading/trailing spaces around the name.
  const match = rule.match(/font-family\s*:\s*(?:['"]\s*([^;'"]+?)\s*['"]|([^;'"\s]+))/i);
  
  if (match) {
    // The name could be in capture group 1 (if quoted) or 2 (if not quoted)
    const name = match[1] || match[2];
    return name ? name.trim() : null;
  }
  return null;
};
