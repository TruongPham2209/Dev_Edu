import type { QuizResponse } from "@/lib/type/quizzes";

export interface QuizValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Validates whether a quiz's questions count matches its matrix type configs before submitting.
 */
export function validateQuizForSubmit(
  quiz: QuizResponse | null,
): QuizValidationResult {
  if (!quiz) {
    return {
      isValid: false,
      errorMessage: "Failed to get quiz details.",
    };
  }

  const targetQuiz = (quiz as unknown as { quiz?: QuizResponse })?.quiz || quiz;
  const typeConfigs = quiz.typeConfigs || targetQuiz.typeConfigs || [];
  const questions = quiz.questions || targetQuiz.questions || [];

  console.log(quiz);

  if (typeConfigs.length === 0) {
    return {
      isValid: false,
      errorMessage:
        "The exam has not been configured with a matrix of question types (Type Configs). Please configure before submitting.",
    };
  }

  if (questions.length === 0) {
    return {
      isValid: false,
      errorMessage:
        "The exam does not have any questions yet. Please add questions before submitting.",
    };
  }

  // Calculate required count per question type
  const requiredCounts: Record<string, number> = {};
  let totalRequired = 0;
  for (const cfg of typeConfigs) {
    requiredCounts[cfg.questionType] =
      (requiredCounts[cfg.questionType] || 0) + cfg.requiredCount;
    totalRequired += cfg.requiredCount;
  }

  // Calculate actual count per question type
  const actualCounts: Record<string, number> = {};
  const totalActual = questions.length;
  for (const q of questions) {
    actualCounts[q.questionType] = (actualCounts[q.questionType] || 0) + 1;
  }

  // Check overall total
  if (totalActual !== totalRequired) {
    return {
      isValid: false,
      errorMessage: `The total number of questions (${totalActual}) does not match the total required in the matrix configuration (${totalRequired}).`,
    };
  }

  // Check per question type
  for (const [qType, reqCount] of Object.entries(requiredCounts)) {
    const actCount = actualCounts[qType] || 0;
    if (actCount !== reqCount) {
      let typeLabel = qType;
      if (qType === "SINGLE_CHOICE") typeLabel = "Single Choice";
      else if (qType === "MULTIPLE_CHOICE") typeLabel = "Multiple Choice";
      else if (qType === "ESSAY") typeLabel = "Essay";

      return {
        isValid: false,
        errorMessage: `The question type "${typeLabel}" currently has ${actCount} questions, which does not match the matrix requirement (${reqCount}).`,
      };
    }
  }

  return { isValid: true };
}
