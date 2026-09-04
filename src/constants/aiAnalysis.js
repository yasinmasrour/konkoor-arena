const AI_ANALYSIS_STATUS = Object.freeze({
  COMPLETED: "completed",
});

const AI_ANALYSIS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    overall: {
      type: "object",
      additionalProperties: false,
      properties: {
        summary: { type: "string" },
        performanceLevel: { type: "string" },
        keyTakeaway: { type: "string" },
      },
      required: ["summary", "performanceLevel", "keyTakeaway"],
    },
    strengths: {
      type: "array",
      items: { type: "string" },
    },
    weaknesses: {
      type: "array",
      items: { type: "string" },
    },
    subjectAnalysis: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          lesson: { type: "string" },
          performance: { type: "string" },
          evidence: { type: "string" },
          advice: { type: "string" },
        },
        required: ["lesson", "performance", "evidence", "advice"],
      },
    },
    priorities: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          lesson: { type: "string" },
          priority: { type: "string" },
          reason: { type: "string" },
        },
        required: ["lesson", "priority", "reason"],
      },
    },
    recommendations: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: [
    "overall",
    "strengths",
    "weaknesses",
    "subjectAnalysis",
    "priorities",
    "recommendations",
  ],
};

module.exports = {
  AI_ANALYSIS_STATUS,
  AI_ANALYSIS_SCHEMA,
};
