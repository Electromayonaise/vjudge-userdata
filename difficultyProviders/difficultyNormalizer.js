export function categorizeDifficulty(oj, rawDifficulty) {
  if (rawDifficulty === null || rawDifficulty === undefined) {
    return {
      raw: "Unknown",
      normalized: "Unknown"
    };
  }

  // Normalizamos el nombre del OJ para evitar fallos por mayúsculas
  const ojNormalized = String(oj).toLowerCase();

  let numericValue = null;
  let textCategory = null;

  // Si viene string
  if (typeof rawDifficulty === "string") {
    const lower = rawDifficulty.toLowerCase().trim();

    // Caso Easy / Medium / Hard directo
    if (lower === "easy" || lower === "medium" || lower === "hard") {
      textCategory =
        lower.charAt(0).toUpperCase() + lower.slice(1);
    }

    // Intentar parsear número
    const parsed = Number(rawDifficulty);
    if (!isNaN(parsed)) {
      numericValue = parsed;
    }
  }

  // Si ya es número
  if (typeof rawDifficulty === "number") {
    numericValue = rawDifficulty;
  }

  // Si ya tenemos categoría textual
  if (textCategory) {
    return {
      raw: rawDifficulty,
      normalized: textCategory
    };
  }

  if (numericValue === null || isNaN(numericValue)) {
    return {
      raw: rawDifficulty,
      normalized: "Unknown"
    };
  }

  let category = "Unknown";

  // CODEFORCES
  if (ojNormalized === "codeforces") {
    if (numericValue <= 1200) category = "Easy";
    else if (numericValue <= 2000) category = "Medium";
    else category = "Hard";
  }

  // CODECHEF
  else if (ojNormalized === "codechef") {
    if (numericValue < 500) category = "Easy";
    else if (numericValue < 1000) category = "Medium";
    else category = "Hard";
  }

  // ATCODER
  else if (ojNormalized === "atcoder") {
    if (numericValue < 400) category = "Easy";
    else if (numericValue < 1200) category = "Medium";
    else category = "Hard";
  }

  // HACKERRANK
  else if (ojNormalized === "hackerrank") {
    if (numericValue < 500) category = "Easy";
    else if (numericValue < 1500) category = "Medium";
    else category = "Hard";
  }

  // CSES (heurística)
  else if (ojNormalized === "cses") {
    if (numericValue <= 1000) category = "Easy";
    else if (numericValue <= 2000) category = "Medium";
    else category = "Hard";
  }

  // DMOJ
  else if (ojNormalized === "dmoj") {
    if (numericValue <= 1200) category = "Easy";
    else if (numericValue <= 2000) category = "Medium";
    else category = "Hard";
  }

  // Fallback universal
  else {
    if (numericValue <= 1000) category = "Easy";
    else if (numericValue <= 2000) category = "Medium";
    else category = "Hard";
  }

  return {
    raw: rawDifficulty,
    normalized: category
  };
}