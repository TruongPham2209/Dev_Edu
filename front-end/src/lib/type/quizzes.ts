export type QuizStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";

export type QuestionType = "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "ESSAY";

export type ScoringMethod = "AUTO" | "MANUAL";

export type AssignmentStatus = "SCHEDULED" | "ACTIVE" | "CLOSED";

export type AttemptStatus =
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "GRADING"
  | "GRADED"
  | "EXPIRED";

// --- Quiz Models ---

export interface QuizTypeConfigResponse {
  id: string;
  quizId: string;
  questionType: QuestionType;
  requiredCount: number;
  pointsPerQuestion: number;
  scoringMethod: ScoringMethod;
}

export interface QuizTypeConfigRequest {
  questionType: QuestionType;
  requiredCount: number;
  pointsPerQuestion: number;
  scoringMethod: ScoringMethod;
}

export interface QuizOptionResponse {
  id: string;
  questionId?: string;
  optionText: string;
  isCorrect?: boolean | null;
  orderIndex: number;
}

export interface QuizOptionRequest {
  id?: string;
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface QuizQuestionResponse {
  id: string;
  quizId: string;
  questionType: QuestionType;
  content: string;
  points: number;
  orderIndex: number;
  options: QuizOptionResponse[];
}

export interface QuizDetailResponse {
  quiz: QuizResponse;
  typeConfigs: QuizTypeConfigResponse[];
  questions: QuizQuestionResponse[];
}

export interface QuizQuestionRequest {
  questionType: QuestionType;
  content: string;
  orderIndex: number;
  options?: QuizOptionRequest[];
}

export interface QuizResponse {
  id: string;
  courseId: string;
  courseTitle?: string;
  title: string;
  description?: string;
  status: QuizStatus;
  rejectionReason?: string | null;
  typeConfigs?: QuizTypeConfigResponse[];
  questions?: QuizQuestionResponse[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuizRequest {
  courseId: string;
  title: string;
  description?: string;
}

export interface QuizReviewRequest {
  approved: boolean;
  rejectionReason?: string;
}

// --- Quiz Assignment Models ---

export interface CreateAssignmentRequest {
  quizId: string;
  startTime: string;
  endTime?: string | null;
  durationMinutes: number;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  maxAttempts: number;
}

export interface QuizAssignmentResponse {
  id: string;
  quizId: string;
  startTime: string;
  endTime?: string | null;
  durationMinutes: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  maxAttempts: number;
  status: AssignmentStatus;
  createdBy?: string;
  createdAt?: string;
}

// --- Student Attempt & Exam Models ---

export interface StudentOptionDto {
  id: string;
  optionText: string;
  orderIndex: number;
}

export interface StudentQuestionDto {
  id: string;
  questionType: QuestionType;
  content: string;
  points: number;
  orderIndex: number;
  options?: StudentOptionDto[];
}

export interface StudentAnswerDto {
  questionId: string;
  selectedOptionIds?: string[];
  answerText?: string | null;
}

export interface StartAttemptResponse {
  attemptId: string;
  assignmentId: string;
  quizId: string;
  quizTitle?: string;
  attemptNumber: number;
  status: AttemptStatus;
  startedAt: string;
  expiresAt: string;
  maxScore: number;
  activeSessionToken: string;
  questions: StudentQuestionDto[];
  existingAnswers?: StudentAnswerDto[];
}

export interface AutosaveRequest {
  questionId: string;
  selectedOptionIds?: string[];
  answerText?: string | null;
  clientSeq: number;
  sessionToken: string;
}

export interface AutosaveResponse {
  attemptId: string;
  questionId: string;
  autosaveVersion: number;
  lastSavedAt: string;
  saved: boolean;
  message?: string;
}

export interface HeartbeatRequest {
  sessionToken: string;
}

export interface SubmitAttemptResponse {
  attemptId: string;
  status: AttemptStatus;
  submittedAt: string;
  totalScore?: number | null;
  maxScore: number;
}

// --- Essay Grading Models ---

export interface PendingGradingResponse {
  attemptId: string;
  quizTitle: string;
  studentUsername: string;
  studentFullName?: string;
  submittedAt: string;
  questionsCount: number;
  pendingEssayCount: number;
}

export interface GradeEssayRequest {
  awardedPoints: number;
  feedback?: string;
}

export interface AttemptQuestionResultDto {
  questionId: string;
  questionType: QuestionType;
  questionContent: string;
  questionPoints: number;
  answerText?: string | null;
  selectedOptionIds?: string[];
  isCorrect?: boolean | null;
  awardedPoints?: number | null;
  feedback?: string | null;
  gradedBy?: string | null;
  gradedAt?: string | null;
  options?: QuizOptionResponse[];
}

export interface AttemptResultResponse {
  attemptId: string;
  assignmentId: string;
  quizId: string;
  studentUsername: string;
  attemptNumber: number;
  status: AttemptStatus;
  startedAt: string;
  submittedAt: string;
  gradedAt: string;
  totalScore?: number | null;
  maxScore: number;
  answers: AttemptQuestionResultDto[];
}
