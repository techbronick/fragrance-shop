/**
 * Normalizes a string by removing diacritics and converting to lowercase.
 * Useful for case-insensitive, diacritic-insensitive search.
 * 
 * Examples:
 * - "Café" → "cafe"
 * - "Parfums de Marly" → "parfums de marly"
 * - "Ștefan" → "stefan"
 */
export const normalizeString = (str: string): string => {
    return str
      .normalize("NFD") // Decompose characters (e.g., é → e + ́)
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritic marks
      .toLowerCase();
  };
  
  /**
   * Checks if a string contains a query (diacritic and case insensitive)
   */
  export const matchesSearch = (text: string, query: string): boolean => {
    if (!query.trim()) return true;
    return normalizeString(text).includes(normalizeString(query));
  };

  /**
 * Gets the normalized first letter of a string for alphabetical grouping.
 * Treats diacritics as base letters (e.g., "Ștefan" → "S").
 * Non-alphabetic characters return "#".
 */
export const getFirstLetter = (str: string): string => {
    if (!str) return "#";
    const normalized = normalizeString(str);
    const firstChar = normalized.charAt(0).toUpperCase();
    // Check if it's a letter A-Z
    if (/[A-Z]/.test(firstChar)) {
      return firstChar;
    }
    return "#"; // Non-alphabetic
  };
  
  /**
   * Groups an array of strings by their first letter.
   * Returns a Map with letters as keys and arrays of original strings as values.
   */
  export const groupByFirstLetter = (items: string[]): Map<string, string[]> => {
    const groups = new Map<string, string[]>();
    
    // Initialize all letters + "#"
    const alphabet = "#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    alphabet.forEach(letter => groups.set(letter, []));
    
    items.forEach(item => {
      const letter = getFirstLetter(item);
      const group = groups.get(letter) || [];
      group.push(item);
      groups.set(letter, group);
    });
    
    return groups;
  };