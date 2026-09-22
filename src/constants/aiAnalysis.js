const AI_ANALYSIS_STATUS = Object.freeze({
  COMPLETED: "completed",
});

// ==================== ساختار خروجی AI ====================
// ⚠️ این ساختار باید کاملاً با:
//    - پرامپت (aiAnalysisService.js)
//    - validation (aiAnalysisValidation.js)
//    - typeهای frontend (aiAnalysisApi.ts)
//    - UI (AIAnalysisSection.tsx)
// هماهنگ باشه.
const AI_ANALYSIS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    overall: {
      type: "object",
      additionalProperties: false,
      properties: {
        summary: { type: "string" },
        keyTakeaway: { type: "string" },
        performanceLevel: { type: ["string", "null"] },
      },
      required: ["summary", "keyTakeaway", "performanceLevel"],
    },

    strengths: {
      type: "array",
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          evidence: { type: "string" },
          why: { type: "string" },
        },
        required: ["title", "evidence", "why"],
      },
    },

    weaknesses: {
      type: "array",
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          evidence: { type: "string" },
          possibleCause: { type: ["string", "null"] },
        },
        required: ["title", "evidence", "possibleCause"],
      },
    },

    subjectAnalysis: {
      type: "object",
      additionalProperties: {
        type: "object",
        additionalProperties: false,
        properties: {
          correct: { type: "integer", minimum: 0 },
          wrong: { type: "integer", minimum: 0 },
          unanswered: { type: "integer", minimum: 0 },
          total: { type: "integer", minimum: 0 },
          percentage: { type: "number", minimum: 0, maximum: 100 },
          notes: { type: "string" },
          dataQualityIssues: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: [
          "correct",
          "wrong",
          "unanswered",
          "total",
          "percentage",
          "notes",
          "dataQualityIssues",
        ],
      },
    },

    priorities: {
      type: "array",
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          topic: { type: "string" },
          priority: {
            type: "string",
            enum: ["بالا", "متوسط", "پایین"],
          },
          reason: { type: "string" },
        },
        required: ["topic", "priority", "reason"],
      },
    },

    recommendations: {
      type: "array",
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          description: { type: "string" },
        },
        required: ["title", "description"],
      },
    },

    // 🆕 مقایسه با میانگین (Backend محاسبه می‌کند، AI فقط تفسیر می‌کند)
    comparison: {
      type: "object",
      additionalProperties: false,
      properties: {
        withAverage: {
          type: "object",
          additionalProperties: false,
          properties: {
            yourScore: { type: "number" },
            averageScore: { type: "number" },
            difference: { type: "number" },
            participantsCount: { type: "integer", minimum: 0 },
            level: {
              type: "string",
              enum: ["بالاتر", "پایین‌تر", "برابر"],
            },
            percentile: {
              type: ["integer", "null"],
              minimum: 0,
              maximum: 100,
            },
          },
          required: [
            "yourScore",
            "averageScore",
            "difference",
            "participantsCount",
            "level",
            "percentile",
          ],
        },
        interpretation: { type: "string" },
      },
      required: ["withAverage", "interpretation"],
    },
  },
  required: [
    "overall",
    "strengths",
    "weaknesses",
    "subjectAnalysis",
    "priorities",
    "recommendations",
    "comparison",
  ],
};

module.exports = {
  AI_ANALYSIS_STATUS,
  AI_ANALYSIS_SCHEMA,
};