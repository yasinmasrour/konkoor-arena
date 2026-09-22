const prisma = require("../config/prisma");
const { aiClient, aiModel } = require("../config/aiProvider");
const { AI_ANALYSIS_STATUS } = require("../constants/aiAnalysis");
const AppError = require("../utils/appError");
const {
  validateAIAnalysisResult,
} = require("../validations/aiAnalysisValidation");

// ==================== محاسبه مقایسه با میانگین ====================
const computeComparison = async (attempt) => {
  // 🔹 همه تلاش‌های submitted در همین آزمون
  const examAttempts = await prisma.attempt.findMany({
    where: {
      examId: attempt.examId,
      status: "submitted",
    },
    select: { score: true },
  });

  const participantsCount = examAttempts.length;
  const scores = examAttempts.map((a) => a.score);
  const yourScore = attempt.score;

  // 🔹 میانگین
  const averageScore =
    participantsCount > 0
      ? Number(
          (scores.reduce((s, v) => s + v, 0) / participantsCount).toFixed(2),
        )
      : 0;

  const difference = Number((yourScore - averageScore).toFixed(2));

  // 🔹 level
  let level = "برابر";
  if (difference > 0.01) level = "بالاتر";
  else if (difference < -0.01) level = "پایین‌تر";

  // 🔹 percentile (چند درصد دانش‌آموزان نمره کمتر یا مساوی دارند)
  let percentile = null;
  if (participantsCount >= 3) {
    const below = scores.filter((s) => s < yourScore).length;
    const equal = scores.filter((s) => s === yourScore).length;
    // رتبه percentile: (تعداد پایین‌تر + نصف برابرها) / کل × ۱۰۰
    percentile = Math.round(((below + equal / 2) / participantsCount) * 100);
    percentile = Math.max(0, Math.min(100, percentile));
  }

  return {
    withAverage: {
      yourScore,
      averageScore,
      difference,
      participantsCount,
      level,
      percentile,
    },
  };
};

// ==================== ساخت ورودی برای AI ====================
const buildAnalysisInput = (attempt, comparison) => {
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
    comparison: comparison.withAverage,
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

// ==================== پرامپت ====================
const buildSystemPrompt = () => {
  return `
You are an educational performance analyst for a Persian exam platform called "Konkoor Arena".

Your task: analyze a student's submitted exam using ONLY the data provided in the input.

═══════════════════════════════════════════════════════════
GENERAL RULES
═══════════════════════════════════════════════════════════

1. OFFICIAL RESULTS
- Never recalculate, modify, or contradict the official score or statistics provided by the backend.
- Treat totalQuestions, correctAnswers, wrongAnswers, unansweredQuestions, percentage, negativeScore, and finalScore as authoritative.
- Do not invent missing statistics.

2. EVIDENCE-BASED ANALYSIS
- Base every conclusion only on the supplied exam and question data.
- Do not assume that one mistake proves lack of knowledge.
- A single wrong answer may be caused by calculation error, misunderstanding, carelessness, or another possibility.
- When evidence is insufficient to determine the cause, use cautious language such as "ممکن است" or "شواهد کافی برای تعیین علت وجود ندارد".
- Clearly distinguish observed performance from interpretation.

3. SMALL SAMPLE SIZE
- If the exam contains only a small number of questions, explicitly acknowledge that the sample is limited.
- Do not generalize performance from one or two questions to the student's overall ability.
- When the sample is very small, prefer neutral descriptions.
- Do not use labels such as "ضعیف", "متوسط", "خوب", "عالی", "مسلط" when the sample is too small.
- In such cases, set performanceLevel to null.

4. QUESTION METADATA
- Use lesson, chapter, subject, and difficulty exactly as provided by the backend.
- Never change, correct, or invent metadata.
- If question content appears inconsistent with its metadata, report it as a data-quality issue in dataQualityIssues.
- Do not assume which metadata is correct.

5. STRENGTHS
- Identify strengths only when supported by the submitted answers.
- Each strength must have: title (short), evidence (from answers), why (analysis).
- Do not exaggerate isolated successes.

6. WEAKNESSES
- Identify weaknesses only when supported by meaningful evidence.
- Each weakness must have: title (short), evidence (from answers), possibleCause (cautious, or null).
- Do not label a student as weak based on one mistake.

7. SUBJECT ANALYSIS
- Analyze each subject using official backend statistics.
- ⚠️ ALL SUBJECT KEYS MUST BE IN PERSIAN (ریاضی، شیمی، فیزیک، زیست، ادبیات، عربی، دینی، زبان، زمین‌شناسی، ...).
- Keep subject names exactly as supplied by the backend.
- Do not move questions between subjects.
- Each subject entry MUST have ALL these fields: correct, wrong, unanswered, total, percentage, notes, dataQualityIssues.
- ⚠️⚠️⚠️ CRITICAL: All numeric fields (correct, wrong, unanswered, total, percentage) are MANDATORY for EVERY subject. NEVER omit any of them. If a subject has 0 wrong answers, write "wrong": 0 — do NOT omit the field.
- If a subject has too few questions for meaningful conclusions, mention the limitation in notes.

8. PRIORITIES
- Priorities must be based on observed weaknesses, unanswered questions, repeated mistakes, or other evidence.
- Each priority must have: topic, priority (بالا/متوسط/پایین), reason.
- Do not create priorities for areas with no supporting evidence.
- A single wrong answer should not automatically create a definite priority.

9. RECOMMENDATIONS
- Give practical and realistic study recommendations.
- Each recommendation must have: title (short), description (actionable).
- Recommendations must follow from the observed performance.
- When the sample is small, recommend broader sampling first.

10. COMPARISON (NEW)
- The input includes a "comparison" object with these fields:
  - yourScore: student's score in this exam
  - averageScore: average score of all students in the SAME exam
  - difference: yourScore - averageScore
  - participantsCount: number of students who took this exam
  - level: "بالاتر" | "پایین‌تر" | "برابر"
  - percentile: approximate percentile (0-100) or null
- Your task: write a "comparison.interpretation" field (2-4 sentences in Persian) that:
  - Interprets the student's performance relative to the group average.
  - Uses cautious language if participantsCount is small (< 5).
  - If percentile is null, do NOT mention percentile.
  - NEVER recalculates or modifies the numbers.
  - If level is "بالاتر": acknowledge it but avoid overpraising.
  - If level is "پایین‌تر": acknowledge it but avoid harsh judgment.
  - If level is "برابر": describe as "close to average".
  - Do NOT invent a ranking or a different percentile.
- ⚠️ You MUST copy ALL numeric fields from input comparison EXACTLY (yourScore, averageScore, difference, participantsCount, level, percentile) into the output.
- Only WRITE the "interpretation" field. Do NOT modify any numbers.

11. LANGUAGE
- All user-facing analysis MUST be written in Persian (فارسی).
- Do not use English, Chinese, or other languages in user-facing text.
- Keep technical terms as-is if needed.

12. HALLUCINATION PREVENTION
- Never invent facts, question content, scores, subjects, lessons, chapters, difficulty levels, or student behavior.
- Never claim the student answered quickly or slowly (no timing data available).
- Never infer information not present in the input.
- Never invent a cause for a wrong answer.

13. ANALYSIS CONSISTENCY
- Keep the analysis internally consistent.
- If you state the sample is too small, do not later make strong conclusions.
- Do not use stronger language in one section than justified elsewhere.

═══════════════════════════════════════════════════════════
OUTPUT FORMAT — READ CAREFULLY
═══════════════════════════════════════════════════════════

Return ONLY a single valid JSON object. No Markdown. No code fences. No explanatory text before or after. Just raw JSON.

The JSON MUST match this exact structure:

{
  "overall": {
    "summary": "جمع‌بندی کلی در ۲ تا ۴ جمله",
    "keyTakeaway": "یک جمله کلیدی",
    "performanceLevel": null
  },
  "strengths": [
    {
      "title": "عنوان کوتاه",
      "evidence": "شواهد از پاسخ‌ها",
      "why": "تحلیل علت"
    }
  ],
  "weaknesses": [
    {
      "title": "عنوان کوتاه",
      "evidence": "شواهد از پاسخ‌ها",
      "possibleCause": null
    }
  ],
  "subjectAnalysis": {
    "ریاضی": {
      "correct": 0,
      "wrong": 0,
      "unanswered": 0,
      "total": 0,
      "percentage": 0,
      "notes": "تحلیل کوتاه",
      "dataQualityIssues": []
    }
  },
  "priorities": [
    {
      "topic": "موضوع",
      "priority": "بالا",
      "reason": "دلیل"
    }
  ],
  "recommendations": [
    {
      "title": "عنوان",
      "description": "توضیح عملی"
    }
  ],
  "comparison": {
    "withAverage": {
      "yourScore": 0,
      "averageScore": 0,
      "difference": 0,
      "participantsCount": 0,
      "level": "برابر",
      "percentile": null
    },
    "interpretation": "تفسیر مقایسه با میانگین در ۲ تا ۴ جمله"
  }
}

═══════════════════════════════════════════════════════════
CRITICAL RULES FOR OUTPUT
═══════════════════════════════════════════════════════════

✅ Return ONLY the JSON object. Nothing else.
✅ NO Markdown code fences (no \`\`\`json or \`\`\`).
✅ NO comments inside JSON.
✅ Every field in the structure above is REQUIRED.
✅ Arrays can be empty [] but must be present.
✅ subjectAnalysis MUST be an object (not array).
✅ ALL subject keys MUST be in Persian.
✅ For EVERY subject in subjectAnalysis, you MUST include ALL 7 fields: correct, wrong, unanswered, total, percentage, notes, dataQualityIssues.
✅ If a numeric field is 0, write 0 — never omit it.
✅ performanceLevel must be either a Persian string or null. If sample is small, use null.
✅ priority must be exactly one of: "بالا", "متوسط", "پایین".
✅ comparison.withAverage.level must be exactly one of: "بالاتر", "پایین‌تر", "برابر".
✅ Copy comparison numeric fields EXACTLY from input. Do NOT modify.

❌ Do NOT wrap the JSON in code fences.
❌ Do NOT add explanations before or after the JSON.
❌ Do NOT use arrays for subjectAnalysis.
❌ Do NOT use English subject names.
❌ Do NOT omit numeric fields.
❌ Do NOT recalculate comparison numbers.

═══════════════════════════════════════════════════════════
EXAMPLE OF A VALID RESPONSE
═══════════════════════════════════════════════════════════

{
  "overall": {
    "summary": "در این آزمون ۴ سوال وجود داشت و ۳ پاسخ صحیح ثبت شد. نمونه کوچک است و نتیجه‌گیری گسترده نیازمند داده بیشتر است.",
    "keyTakeaway": "برای ارزیابی دقیق‌تر، شرکت در آزمون‌های با تعداد سوال بیشتر توصیه می‌شود.",
    "performanceLevel": null
  },
  "strengths": [
    {
      "title": "عملکرد صحیح در ریاضی",
      "evidence": "هر دو سوال ریاضی این آزمون به‌درستی پاسخ داده شدند.",
      "why": "این نشان‌دهنده آشنایی با مباحث پایه ریاضی است، هرچند نمونه کوچک است."
    }
  ],
  "weaknesses": [
    {
      "title": "خطا در فیزیک",
      "evidence": "تنها سوال فیزیک این آزمون نادرست پاسخ داده شده است.",
      "possibleCause": "ممکن است فرمول مورد استفاده اشتباه بوده باشد، اما شواهد کافی برای تعیین قطعی علت وجود ندارد."
    }
  ],
  "subjectAnalysis": {
    "ریاضی": {
      "correct": 2,
      "wrong": 0,
      "unanswered": 0,
      "total": 2,
      "percentage": 100,
      "notes": "نمونه کوچک است؛ نتیجه قابل تعمیم به کل درس نیست.",
      "dataQualityIssues": []
    },
    "فیزیک": {
      "correct": 0,
      "wrong": 1,
      "unanswered": 0,
      "total": 1,
      "percentage": 0,
      "notes": "تنها یک سوال؛ نمونه برای نتیجه‌گیری کافی نیست.",
      "dataQualityIssues": []
    }
  },
  "priorities": [
    {
      "topic": "فیزیک - مباحث پایه",
      "priority": "متوسط",
      "reason": "تنها سوال فیزیک نادرست پاسخ داده شده، اما نمونه محدود است."
    }
  ],
  "recommendations": [
    {
      "title": "افزایش نمونه‌برداری",
      "description": "شرکت در آزمون‌های با سوالات بیشتر از فیزیک برای ارزیابی دقیق‌تر."
    }
  ],
  "comparison": {
    "withAverage": {
      "yourScore": 3,
      "averageScore": 2.5,
      "difference": 0.5,
      "participantsCount": 8,
      "level": "بالاتر",
      "percentile": 62
    },
    "interpretation": "عملکرد شما در این آزمون کمی بالاتر از میانگین گروه است. با توجه به تعداد شرکت‌کنندگان (۸ نفر)، این تفاوت معنادار اما نه قطعی است. برای ارزیابی دقیق‌تر، شرکت در آزمون‌های بعدی توصیه می‌شود."
  }
}

═══════════════════════════════════════════════════════════
FINAL REMINDER
═══════════════════════════════════════════════════════════

Your entire response MUST be a single JSON object and nothing else.
The first character of your response must be "{" and the last must be "}".
`.trim();
};

// ==================== گرفتن Attempt ====================
const getAttemptForStudent = async (attemptId, userId) => {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: { select: { id: true, title: true } },
      answers: {
        include: { question: true },
        orderBy: { createdAt: "asc" },
      },
      aiAnalysis: true,
    },
  });

  if (!attempt) throw new AppError("Attempt not found", 404);
  if (attempt.studentId !== userId) throw new AppError("Forbidden", 403);
  if (attempt.status !== "submitted")
    throw new AppError("Attempt has not been submitted", 400);

  return attempt;
};

// ==================== گرفتن تحلیل موجود ====================
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

// ==================== پاکسازی خروجی AI ====================
const sanitizeJSONOutput = (raw) => {
  if (typeof raw !== "string") return raw;

  let text = raw.trim();

  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "");
    text = text.replace(/\s*```$/, "");
    text = text.trim();
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    text = text.slice(firstBrace, lastBrace + 1);
  }

  return text;
};

const tryParse = (raw) => {
  try {
    const cleaned = sanitizeJSONOutput(raw);
    return { success: true, data: JSON.parse(cleaned) };
  } catch (error) {
    return { success: false, error };
  }
};

// ==================== تولید تحلیل ====================
const generateAnalysis = async (attemptId, userId) => {
  if (!aiClient) {
    throw new AppError("AI analysis is not configured on the server", 503);
  }

  const attempt = await getAttemptForStudent(attemptId, userId);

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

  // 🔹 محاسبه comparison
  console.time("[AI] Compute comparison");
  const comparison = await computeComparison(attempt);
  console.timeEnd("[AI] Compute comparison");

  console.log("[AI] Comparison:", JSON.stringify(comparison.withAverage));

  // 🔹 ساخت ورودی
  console.time("[AI] Build input");
  const analysisInput = buildAnalysisInput(attempt, comparison);
  const analysisInputJson = JSON.stringify(analysisInput);
  console.timeEnd("[AI] Build input");

  console.log("[AI] Input size:", analysisInputJson.length, "chars");
  console.log("[AI] Questions:", analysisInput.questions.length);

  // 🔹 درخواست به AI
  let response;
  console.time("[AI] Request");

  try {
    console.log("[AI] Sending request to AI provider...");

    response = await aiClient.responses.create({
      model: aiModel,
      instructions: buildSystemPrompt(),
      input: analysisInputJson,
    });

    console.timeEnd("[AI] Request");
    console.log("[AI] Response ID:", response.id);
    console.log("[AI] Response model:", response.model);
    console.log("[AI] Output text exists:", Boolean(response.output_text));
  } catch (error) {
    console.timeEnd("[AI] Request");
    console.timeEnd("[AI] Total analysis");

    console.error("[AI] Request failed:", error);
    throw new AppError("AI analysis service is temporarily unavailable", 503);
  }

  if (!response.output_text) {
    console.timeEnd("[AI] Total analysis");
    throw new AppError("AI analysis returned an empty response", 502);
  }

  // 🔹 Parse
  console.time("[AI] JSON parse");
  const parsed = tryParse(response.output_text);
  console.timeEnd("[AI] JSON parse");

  if (!parsed.success) {
    console.timeEnd("[AI] Total analysis");
    console.error("[AI] Invalid JSON:", parsed.error);
    console.error("[AI] Raw output:", response.output_text);
    throw new AppError("AI analysis returned an invalid JSON", 502);
  }

  const result = parsed.data;

  // 🔹 Validation
  console.time("[AI] Validation");
  const validation = validateAIAnalysisResult(result);

  if (!validation.valid) {
    console.timeEnd("[AI] Validation");
    console.timeEnd("[AI] Total analysis");
    console.error("[AI] Validation errors:", validation.errors);
    console.error("[AI] Raw result:", JSON.stringify(result, null, 2));
    throw new AppError(
      `AI analysis returned an invalid structure: ${validation.errors
        .slice(0, 3)
        .join(", ")}`,
      502,
    );
  }
  console.timeEnd("[AI] Validation");

  // 🔹 Backend اعداد comparison رو override می‌کنه
  // تا AI نتونه دست‌کاری کنه
  result.comparison = {
    withAverage: comparison.withAverage,
    interpretation: result.comparison.interpretation,
  };

  // 🔹 ذخیره
  console.time("[AI] DB save");
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
    console.timeEnd("[AI] DB save");
    console.timeEnd("[AI] Total analysis");

    if (error.code !== "P2002") throw error;

    saved = await prisma.aIAnalysis.findUnique({
      where: { attemptId: attempt.id },
    });

    if (!saved) throw error;

    return {
      attemptId: attempt.id,
      status: saved.status,
      model: saved.model,
      generatedAt: saved.generatedAt,
      analysis: saved.result,
      cached: true,
    };
  }

  console.timeEnd("[AI] DB save");
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
