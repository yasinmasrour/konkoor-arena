const { z } = require("zod");
const { QUESTION_REVIEW_DECISION } = require("../constants/questionReview");

const questionReviewDecisionSchema = z.object({
  decision: z.enum([
    QUESTION_REVIEW_DECISION.APPROVED,
    QUESTION_REVIEW_DECISION.CHANGES_REQUESTED,
    QUESTION_REVIEW_DECISION.ARCHIVED,
  ]),
  note: z.string().trim().max(2000).optional(),
});

module.exports = { questionReviewDecisionSchema };
