const prisma = require("../config/prisma");
const { aiClient, aiModel } = require("../config/aiProvider");
const { AI_ANALYSIS_STATUS } = require("../constants/aiAnalysis");
const AppError = require("../utils/appError");
const {
  validateAIAnalysisResult,
} = require("../validations/aiAnalysisValidation");

const buildAnalysisInput = (attempt) => {
  const deterministic = attempt.analysis || {};

  return {
    exam: {
      id: attempt.exam.id,
      title: attempt.exam.title,
    },
    result: {
      totalQuestions: deterministic.totalQuestions || attempt.answers.length,
      correctAnswers: deterministic.correctAnswers || 0,
      wrongAnswers: deterministic.wrongAnswers || 0,
      unansweredQuestions: deterministic.unansweredQuestions || 0,
      negativeScore: deterministic.negativeScore || 0,
      finalScore: attempt.score,
      percentage: deterministic.percentage || 0,
      subjects: deterministic.subjects || [],
    },
    questions: attempt.answers.map((answer, index) => ({
      number: index + 1,
      question: answer.questionTextSnapshot ?? answer.question.questionText,
      options: answer.optionsSnapshot?.length
        ? answer.optionsSnapshot
        : answer.question.options,
      selectedAnswer: answer.selectedAnswer,
      correctAnswer:
        answer.correctAnswerSnapshot ?? answer.question.correctAnswer,
      isCorrect: answer.isCorrect,
      lesson: answer.lessonSnapshot ?? answer.question.lesson,
      chapter: answer.chapterSnapshot ?? answer.question.chapter,
      difficulty: answer.difficultySnapshot ?? answer.question.difficulty,
      explanation: answer.explanationSnapshot ?? answer.question.explanation,
    })),
  };
};

const getAttemptForStudent = async (attemptId, userId) => {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: {
        select: {
          id: true,
          title: true,
        },
      },
      answers: {
        include: {
          question: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      aiAnalysis: true,
    },
  });

  if (!attempt) {
    throw new AppError("Attempt not found", 404);
  }

  if (attempt.studentId !== userId) {
    throw new AppError("Forbidden", 403);
  }

  if (attempt.status !== "submitted") {
    throw new AppError("Attempt has not been submitted", 400);
  }

  return attempt;
};

const getMyAnalysis = async (attemptId, userId) => {
  const attempt = await getAttemptForStudent(attemptId, userId);

  if (!attempt.aiAnalysis) {
    throw new AppError("AI analysis has not been generated yet", 404);
  }

  return {
    attemptId: attempt.id,
    status: attempt.aiAnalysis.status,
    model: attempt.aiAnalysis.model,
    generatedAt: attempt.aiAnalysis.generatedAt,
    analysis: attempt.aiAnalysis.result,
  };
};

const generateAnalysis = async (attemptId, userId) => {
  if (!aiClient) {
    throw new AppError("AI analysis is not configured on the server", 503);
  }

  const attempt = await getAttemptForStudent(attemptId, userId);

  // AI analysis is intentionally generated once per submitted attempt.
  if (attempt.aiAnalysis) {
    return {
      attemptId: attempt.id,
      status: attempt.aiAnalysis.status,
      model: attempt.aiAnalysis.model,
      generatedAt: attempt.aiAnalysis.generatedAt,
      analysis: attempt.aiAnalysis.result,
      cached: true,
    };
  }

  console.time("[AI] Total analysis");

  console.time("[AI] Build input");

  const analysisInput = buildAnalysisInput(attempt);
  const analysisInputJson = JSON.stringify(analysisInput);

  console.timeEnd("[AI] Build input");

  console.log("[AI] Input size:", analysisInputJson.length, "characters");

  console.log("[AI] Questions:", analysisInput.questions.length);

  let response;

  console.time("[AI] GapGPT request");

  try {
    console.log("[AI] Sending request to GapGPT...");

    response = await aiClient.responses.create({
      model: aiModel,
      instructions: `
  You are an educational performance analyst for a Persian exam platform.

  Your task is to analyze a student's submitted exam using ONLY the data provided in the input.

  IMPORTANT RULES:

  1. OFFICIAL RESULTS
  - Never recalculate, modify, or contradict the official score or statistics provided by the backend.
  - Treat totalQuestions, correctAnswers, wrongAnswers, unansweredQuestions, percentage, negativeScore, and finalScore as authoritative.
  - Do not invent missing statistics.

  2. EVIDENCE-BASED ANALYSIS
  - Base every conclusion only on the supplied exam and question data.
  - Do not assume that one mistake proves lack of knowledge.
  - A single wrong answer may be caused by calculation error, misunderstanding, carelessness, or another possibility.
  - When the available evidence is insufficient to determine the cause, use cautious language such as "ممکن است" or "شواهد کافی برای تعیین علت وجود ندارد".
  - Never make a definitive claim about a student's mastery from a very small number of questions.
  - Clearly distinguish observed performance from interpretation.

  3. SMALL SAMPLE SIZE
  - If the exam contains only a small number of questions, explicitly acknowledge that the sample is limited.
  - Do not generalize performance from one or two questions to the student's overall ability.
  - One correct answer does not establish mastery.
  - One wrong answer does not establish a weakness.
  - A very high or very low percentage from a very small sample must not be treated as a reliable measure of overall ability.
  - When the sample is very small, prefer neutral descriptions such as "در این نمونه عملکرد ثبت‌شده..." rather than qualitative labels.
  - Do not use labels such as "ضعیف", "متوسط", "خوب", "عالی", "مسلط" or similar overall performance classifications when the sample is too small to support them.

  4. PERFORMANCE LABELS
  - Do not assign qualitative performance levels unless the supplied data contains enough evidence to justify them.
  - Never infer a student's general ability from the percentage alone.
  - For small samples, report the observed statistics without judging the student's overall level.
  - For example, prefer "در این آزمون ۵۰٪ پاسخ‌ها درست بوده است" over "عملکرد متوسط یا ضعیف بوده است".
  - Do not describe 50% as "متوسط رو به پایین", "ضعیف", or any similar judgment when only a small number of questions are available.

  5. QUESTION METADATA
  - Use lesson, chapter, subject, and difficulty exactly as provided by the backend.
  - Never change, correct, or invent metadata.
  - If the question content appears inconsistent with its metadata, report the inconsistency as a data-quality issue.
  - Do not assume which metadata is correct.

  6. DIFFICULTY INTERPRETATION
  - Difficulty is metadata supplied by the backend and must not be treated as proof of a student's ability.
  - A wrong answer to a hard question does not by itself establish a weakness.
  - A correct answer to a hard question does not by itself establish mastery.
  - When only one question exists for a difficulty level, describe the observed result without making a general conclusion about that difficulty level.

  7. STRENGTHS
  - Identify strengths only when supported by the submitted answers.
  - Do not exaggerate isolated successes.
  - If evidence is limited, describe the observed successful behavior rather than claiming broad mastery.
  - A single correct answer should be described as an observed success, not as evidence of mastery.

  8. WEAKNESSES
  - Identify weaknesses only when supported by meaningful evidence.
  - Do not label a student as weak in a subject based on one mistake.
  - Distinguish observed errors from possible underlying causes.
  - If there is insufficient evidence for a weakness, do not invent one.
  - Do not infer the cause of a wrong answer unless the input explicitly provides evidence for that cause.

  9. SUBJECT ANALYSIS
  - Analyze each subject using the official backend statistics and supplied question metadata.
  - Keep subject names exactly as supplied.
  - Do not move questions between subjects.
  - If there are too few questions for meaningful statistical conclusions, explicitly mention the limitation.
  - Do not describe a subject as weak, strong, mastered, or poorly understood unless the supplied evidence is sufficient.
  - When only one or two questions belong to a subject, report the observed statistics and explicitly note the limited sample.

  10. PRIORITIES
  - Priorities must be based on observed weaknesses, unanswered questions, repeated mistakes, difficult questions, or other evidence in the input.
  - Do not create priorities for areas where there is no supporting evidence.
  - A single wrong answer should not automatically create a definite subject-level priority.
  - When evidence is limited, prioritize verification, targeted review, additional practice, and broader sampling rather than claiming a definite deficiency.
  - Do not prioritize a topic solely because one question happened to be difficult.

  11. RECOMMENDATIONS
  - Give practical and realistic study recommendations.
  - Recommendations must follow from the observed performance.
  - Do not recommend unrelated topics.
  - Do not recommend a specific remediation strategy unless the supplied data provides evidence supporting it.
  - When the sample is small, recommend additional practice and broader sampling before making strong conclusions about long-term weaknesses.
  - If metadata and question content conflict, recommend checking the platform's question categorization rather than deciding which classification is correct.

  12. DATA CONSISTENCY
  - You may identify inconsistencies between question text and metadata.
  - Do not silently correct inconsistent data.
  - Clearly distinguish observed facts from interpretations.
  - If metadata conflicts with question content, report the conflict as a data-quality issue and do not use the conflicting metadata to make strong conclusions about the student's knowledge.

  13. LANGUAGE
  - All user-facing analysis must be written in Persian.
  - Keep technical subject names or lesson names exactly as provided when appropriate.
  - Use clear, professional, student-friendly Persian.
  - Do not use Chinese, English, or other languages in user-facing analysis unless they are part of an actual subject, lesson, chapter, or other supplied metadata.

  14. OUTPUT FORMAT
  Return ONLY valid JSON.
  Do not use Markdown.
  Do not wrap the JSON in code fences.

  Return exactly these fields:

  {
    "overall": "string",
    "strengths": ["string"],
    "weaknesses": ["string"],
    "subjectAnalysis": {},
    "priorities": ["string"],
    "recommendations": ["string"]
  }

  Do NOT include generatedAt.
  The backend is responsible for generating the analysis timestamp.

  15. HALLUCINATION PREVENTION
  - Never invent facts, question content, scores, subjects, lessons, chapters, difficulty levels, or student behavior.
  - Never claim that the student answered quickly or slowly because response-time data is not available.
  - Never infer information that is not present in the input.
  - Never invent a cause for a wrong answer.
  - Never treat metadata as evidence of knowledge beyond what is explicitly supported by the submitted answers and official statistics.

  16. ANALYSIS CONSISTENCY
  - Keep the analysis internally consistent.
  - If you state that the sample is too small for a reliable conclusion, do not later make a strong conclusion based on that same small sample.
  - If you describe a result as limited evidence, all strengths, weaknesses, priorities, and recommendations must respect that limitation.
  - Do not use stronger language in one section than is justified by the evidence in another section.
`.trim(),
      input: analysisInputJson,
    });

    console.timeEnd("[AI] GapGPT request");

    console.log("[AI] Response received.");
    console.log("[AI] Response ID:", response.id);
    console.log("[AI] Response model:", response.model);
    console.log("[AI] Output text exists:", Boolean(response.output_text));
  } catch (error) {
    console.timeEnd("[AI] GapGPT request");
    console.timeEnd("[AI] Total analysis");

    console.error("[AI] Request failed:", error);

    throw new AppError("AI analysis service is temporarily unavailable", 503);
  }

  if (!response.output_text) {
    console.timeEnd("[AI] Total analysis");

    throw new AppError("AI analysis returned an empty response", 502);
  }

  console.time("[AI] JSON parse");

  let result;

  try {
    result = JSON.parse(response.output_text);
  } catch (error) {
    console.timeEnd("[AI] JSON parse");
    console.timeEnd("[AI] Total analysis");

    console.error("[AI] Analysis returned invalid JSON:", error);

    throw new AppError("AI analysis returned an invalid response", 502);
  }

  console.timeEnd("[AI] JSON parse");

  console.time("[AI] Validation");

  const validation = validateAIAnalysisResult(result);

  if (!validation.valid) {
    console.timeEnd("[AI] Validation");
    console.timeEnd("[AI] Total analysis");

    console.error("[AI] Analysis validation failed:", validation.errors);

    throw new AppError("AI analysis returned an invalid structure", 502);
  }

  console.timeEnd("[AI] Validation");

  // The backend owns the timestamp.
  // Never store a timestamp generated by the AI.
  delete result.generatedAt;

  console.time("[AI] Database save");

  let saved;

  try {
    saved = await prisma.aIAnalysis.create({
      data: {
        attemptId: attempt.id,
        userId: attempt.studentId,
        model: response.model || aiModel,
        status: AI_ANALYSIS_STATUS.COMPLETED,
        result,
        responseId: response.id,
        generatedAt: new Date(),
      },
    });
  } catch (error) {
    console.timeEnd("[AI] Database save");
    console.timeEnd("[AI] Total analysis");

    // Two requests may finish simultaneously.
    // The unique attemptId guarantees only one analysis is stored.
    if (error.code !== "P2002") {
      throw error;
    }

    saved = await prisma.aIAnalysis.findUnique({
      where: {
        attemptId: attempt.id,
      },
    });

    if (!saved) {
      throw error;
    }

    return {
      attemptId: attempt.id,
      status: saved.status,
      model: saved.model,
      generatedAt: saved.generatedAt,
      analysis: saved.result,
      cached: true,
    };
  }

  console.timeEnd("[AI] Database save");
  console.timeEnd("[AI] Total analysis");

  return {
    attemptId: attempt.id,
    status: saved.status,
    model: saved.model,
    generatedAt: saved.generatedAt,
    analysis: saved.result,
    cached: false,
  };
};

module.exports = {
  generateAnalysis,
  getMyAnalysis,
};
