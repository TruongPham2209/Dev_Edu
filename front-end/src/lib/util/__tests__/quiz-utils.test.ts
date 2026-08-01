import { describe, expect, it } from "vitest";
import type { QuizResponse } from "@/lib/type/quizzes";
import { validateQuizForSubmit } from "../quiz-utils";

describe("validateQuizForSubmit", () => {
  it("should return invalid if quiz is null", () => {
    const result = validateQuizForSubmit(null);
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain("Failed to get quiz details");
  });

  it("should return invalid if typeConfigs is missing or empty", () => {
    const quiz: QuizResponse = {
      id: "q1",
      courseId: "c1",
      title: "Test Quiz",
      status: "DRAFT",
      typeConfigs: [],
      questions: [],
    };
    const result = validateQuizForSubmit(quiz);
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain("not been configured with a matrix");
  });

  it("should return invalid if questions list is empty", () => {
    const quiz: QuizResponse = {
      id: "q1",
      courseId: "c1",
      title: "Test Quiz",
      status: "DRAFT",
      typeConfigs: [
        {
          id: "cfg1",
          quizId: "q1",
          questionType: "SINGLE_CHOICE",
          requiredCount: 2,
          pointsPerQuestion: 1,
          scoringMethod: "AUTO",
        },
      ],
      questions: [],
    };
    const result = validateQuizForSubmit(quiz);
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain("does not have any questions yet");
  });

  it("should return invalid if questions count per type does not match typeConfigs", () => {
    const quiz: QuizResponse = {
      id: "q1",
      courseId: "c1",
      title: "Test Quiz",
      status: "DRAFT",
      typeConfigs: [
        {
          id: "cfg1",
          quizId: "q1",
          questionType: "SINGLE_CHOICE",
          requiredCount: 2,
          pointsPerQuestion: 1,
          scoringMethod: "AUTO",
        },
      ],
      questions: [
        {
          id: "quest1",
          quizId: "q1",
          questionType: "SINGLE_CHOICE",
          content: "Question 1",
          points: 1,
          orderIndex: 1,
          options: [],
        },
      ],
    };
    const result = validateQuizForSubmit(quiz);
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain("does not match");
  });

  it("should return valid when questions match typeConfigs exactly", () => {
    const quiz: QuizResponse = {
      id: "q1",
      courseId: "c1",
      title: "Test Quiz",
      status: "DRAFT",
      typeConfigs: [
        {
          id: "cfg1",
          quizId: "q1",
          questionType: "SINGLE_CHOICE",
          requiredCount: 2,
          pointsPerQuestion: 1,
          scoringMethod: "AUTO",
        },
        {
          id: "cfg2",
          quizId: "q1",
          questionType: "ESSAY",
          requiredCount: 1,
          pointsPerQuestion: 3,
          scoringMethod: "MANUAL",
        },
      ],
      questions: [
        {
          id: "q1_1",
          quizId: "q1",
          questionType: "SINGLE_CHOICE",
          content: "Q1",
          points: 1,
          orderIndex: 1,
          options: [],
        },
        {
          id: "q1_2",
          quizId: "q1",
          questionType: "SINGLE_CHOICE",
          content: "Q2",
          points: 1,
          orderIndex: 2,
          options: [],
        },
        {
          id: "q1_3",
          quizId: "q1",
          questionType: "ESSAY",
          content: "Q3",
          points: 3,
          orderIndex: 3,
          options: [],
        },
      ],
    };
    const result = validateQuizForSubmit(quiz);
    expect(result.isValid).toBe(true);
    expect(result.errorMessage).toBeUndefined();
  });
});
