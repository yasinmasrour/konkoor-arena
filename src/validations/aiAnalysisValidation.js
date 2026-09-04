const validateAIAnalysisResult = (result) => {
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    return {
      valid: false,
      errors: ["AI response must be a JSON object"],
    };
  }

  const errors = [];

  if (typeof result.overall !== "string" || !result.overall.trim()) {
    errors.push("overall must be a non-empty string");
  }

  const arrayFields = [
    "strengths",
    "weaknesses",
    "priorities",
    "recommendations",
  ];

  for (const field of arrayFields) {
    if (!Array.isArray(result[field])) {
      errors.push(`${field} must be an array`);
      continue;
    }

    if (!result[field].every((item) => typeof item === "string")) {
      errors.push(`${field} must contain only strings`);
    }
  }

  if (
    !result.subjectAnalysis ||
    typeof result.subjectAnalysis !== "object" ||
    Array.isArray(result.subjectAnalysis)
  ) {
    errors.push("subjectAnalysis must be an object");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateAIAnalysisResult,
};
