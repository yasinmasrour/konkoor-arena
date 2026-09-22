// ==================== چک‌های پایه ====================
const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;
const isStringOrNull = (v) => v === null || typeof v === "string";
const isNonNegativeInt = (v) => Number.isInteger(v) && v >= 0;
const isPercentage = (v) => typeof v === "number" && v >= 0 && v <= 100;
const isFiniteNumber = (v) => typeof v === "number" && Number.isFinite(v);

// ==================== اعتبارسنجی خروجی AI ====================
const validateAIAnalysisResult = (result) => {
  const errors = [];

  if (!result || typeof result !== "object" || Array.isArray(result)) {
    return {
      valid: false,
      errors: ["AI response must be a JSON object"],
    };
  }

  // ==================== overall ====================
  if (!result.overall || typeof result.overall !== "object") {
    errors.push("overall must be an object");
  } else {
    const { summary, keyTakeaway, performanceLevel } = result.overall;
    if (!isNonEmptyString(summary))
      errors.push("overall.summary must be a non-empty string");
    if (!isNonEmptyString(keyTakeaway))
      errors.push("overall.keyTakeaway must be a non-empty string");
    if (!isStringOrNull(performanceLevel))
      errors.push("overall.performanceLevel must be string or null");
  }

  // ==================== strengths ====================
  if (!Array.isArray(result.strengths)) {
    errors.push("strengths must be an array");
  } else {
    result.strengths.forEach((item, i) => {
      if (!item || typeof item !== "object") {
        errors.push(`strengths[${i}] must be an object`);
        return;
      }
      if (!isNonEmptyString(item.title))
        errors.push(`strengths[${i}].title must be a non-empty string`);
      if (!isNonEmptyString(item.evidence))
        errors.push(`strengths[${i}].evidence must be a non-empty string`);
      if (!isNonEmptyString(item.why))
        errors.push(`strengths[${i}].why must be a non-empty string`);
    });
  }

  // ==================== weaknesses ====================
  if (!Array.isArray(result.weaknesses)) {
    errors.push("weaknesses must be an array");
  } else {
    result.weaknesses.forEach((item, i) => {
      if (!item || typeof item !== "object") {
        errors.push(`weaknesses[${i}] must be an object`);
        return;
      }
      if (!isNonEmptyString(item.title))
        errors.push(`weaknesses[${i}].title must be a non-empty string`);
      if (!isNonEmptyString(item.evidence))
        errors.push(`weaknesses[${i}].evidence must be a non-empty string`);
      if (!isStringOrNull(item.possibleCause))
        errors.push(`weaknesses[${i}].possibleCause must be string or null`);
    });
  }

  // ==================== subjectAnalysis ====================
  if (
    !result.subjectAnalysis ||
    typeof result.subjectAnalysis !== "object" ||
    Array.isArray(result.subjectAnalysis)
  ) {
    errors.push("subjectAnalysis must be an object");
  } else {
    Object.entries(result.subjectAnalysis).forEach(([subject, data]) => {
      if (!data || typeof data !== "object") {
        errors.push(`subjectAnalysis[${subject}] must be an object`);
        return;
      }

      if (!isNonNegativeInt(data.correct))
        errors.push(
          `subjectAnalysis[${subject}].correct must be a non-negative integer`,
        );
      if (!isNonNegativeInt(data.wrong))
        errors.push(
          `subjectAnalysis[${subject}].wrong must be a non-negative integer`,
        );
      if (!isNonNegativeInt(data.unanswered))
        errors.push(
          `subjectAnalysis[${subject}].unanswered must be a non-negative integer`,
        );
      if (!isNonNegativeInt(data.total))
        errors.push(
          `subjectAnalysis[${subject}].total must be a non-negative integer`,
        );
      if (!isPercentage(data.percentage))
        errors.push(`subjectAnalysis[${subject}].percentage must be 0-100`);
      if (!isNonEmptyString(data.notes))
        errors.push(
          `subjectAnalysis[${subject}].notes must be a non-empty string`,
        );

      if (!Array.isArray(data.dataQualityIssues))
        errors.push(
          `subjectAnalysis[${subject}].dataQualityIssues must be an array`,
        );
      else if (!data.dataQualityIssues.every((x) => typeof x === "string"))
        errors.push(
          `subjectAnalysis[${subject}].dataQualityIssues must contain strings`,
        );
    });
  }

  // ==================== priorities ====================
  if (!Array.isArray(result.priorities)) {
    errors.push("priorities must be an array");
  } else {
    result.priorities.forEach((item, i) => {
      if (!item || typeof item !== "object") {
        errors.push(`priorities[${i}] must be an object`);
        return;
      }
      if (!isNonEmptyString(item.topic))
        errors.push(`priorities[${i}].topic must be a non-empty string`);
      if (!["بالا", "متوسط", "پایین"].includes(item.priority))
        errors.push(`priorities[${i}].priority must be بالا/متوسط/پایین`);
      if (!isNonEmptyString(item.reason))
        errors.push(`priorities[${i}].reason must be a non-empty string`);
    });
  }

  // ==================== recommendations ====================
  if (!Array.isArray(result.recommendations)) {
    errors.push("recommendations must be an array");
  } else {
    result.recommendations.forEach((item, i) => {
      if (!item || typeof item !== "object") {
        errors.push(`recommendations[${i}] must be an object`);
        return;
      }
      if (!isNonEmptyString(item.title))
        errors.push(`recommendations[${i}].title must be a non-empty string`);
      if (!isNonEmptyString(item.description))
        errors.push(
          `recommendations[${i}].description must be a non-empty string`,
        );
    });
  }

  // ==================== comparison 🆕 ====================
  if (!result.comparison || typeof result.comparison !== "object") {
    errors.push("comparison must be an object");
  } else {
    const { withAverage, interpretation } = result.comparison;

    if (!isNonEmptyString(interpretation))
      errors.push("comparison.interpretation must be a non-empty string");

    if (!withAverage || typeof withAverage !== "object") {
      errors.push("comparison.withAverage must be an object");
    } else {
      if (!isFiniteNumber(withAverage.yourScore))
        errors.push("comparison.withAverage.yourScore must be a number");
      if (!isFiniteNumber(withAverage.averageScore))
        errors.push("comparison.withAverage.averageScore must be a number");
      if (!isFiniteNumber(withAverage.difference))
        errors.push("comparison.withAverage.difference must be a number");
      if (!isNonNegativeInt(withAverage.participantsCount))
        errors.push(
          "comparison.withAverage.participantsCount must be a non-negative integer",
        );
      if (!["بالاتر", "پایین‌تر", "برابر"].includes(withAverage.level))
        errors.push(
          "comparison.withAverage.level must be بالاتر/پایین‌تر/برابر",
        );
      if (
        withAverage.percentile !== null &&
        !isPercentage(withAverage.percentile)
      )
        errors.push("comparison.withAverage.percentile must be 0-100 or null");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateAIAnalysisResult,
};
