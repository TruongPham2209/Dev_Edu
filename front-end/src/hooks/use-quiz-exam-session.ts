"use client";

import {
  useAutosaveAttemptMutation,
  useHeartbeatAttemptMutation,
} from "@/lib/api/quizzes";
import type { AutosaveRequest, StudentAnswerDto } from "@/lib/type/quizzes";
import { useCallback, useEffect, useRef, useState } from "react";

export interface UseQuizExamSessionProps {
  attemptId: string;
  expiresAt: string;
  initialAnswers?: StudentAnswerDto[];
  onSubmit: () => void;
}

export type AutosaveState = "SAVED" | "SAVING" | "ERROR";

export function useQuizExamSession({
  attemptId,
  expiresAt,
  initialAnswers = [],
  onSubmit,
}: UseQuizExamSessionProps) {
  // Session Token (UUID v4 stored per attempt in sessionStorage)
  const [sessionToken, setSessionToken] = useState<string>("");
  const [isSessionLocked, setIsSessionLocked] = useState<boolean>(false);
  const [sessionLockMessage, setSessionLockMessage] = useState<string>("");

  // Countdown timer in seconds
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  // React Query mutations
  const autosaveMutation = useAutosaveAttemptMutation();
  const heartbeatMutation = useHeartbeatAttemptMutation();

  // Answers Map: questionId -> { selectedOptionIds, answerText }
  const [answersMap, setAnswersMap] = useState<
    Record<string, { selectedOptionIds?: string[]; answerText?: string }>
  >(() => {
    const initial: Record<
      string,
      { selectedOptionIds?: string[]; answerText?: string }
    > = {};
    initialAnswers.forEach((ans) => {
      initial[ans.questionId] = {
        selectedOptionIds: ans.selectedOptionIds,
        answerText: ans.answerText || undefined,
      };
    });
    return initial;
  });

  // Sequence counter for Autosave
  const clientSeqRef = useRef<number>(1);
  const [autosaveState, setAutosaveState] = useState<AutosaveState>("SAVED");
  const debouncedTimersRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Initialize Session Token
  useEffect(() => {
    if (!attemptId) return;
    const storageKey = `quiz_session_token_${attemptId}`;
    let token = sessionStorage.getItem(storageKey);
    if (!token) {
      token = crypto.randomUUID
        ? crypto.randomUUID()
        : `token_${Date.now()}_${Math.random()}`;
      sessionStorage.setItem(storageKey, token);
    }
    setSessionToken(token);
  }, [attemptId]);

  // Countdown Timer Effect
  useEffect(() => {
    if (!expiresAt) return;

    const targetTime = new Date(expiresAt).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((targetTime - now) / 1000));
      setTimeRemaining(diff);

      if (diff <= 0) {
        setIsExpired(true);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  // Auto-submit when expired
  const submittedRef = useRef(false);
  useEffect(() => {
    if (isExpired && !submittedRef.current) {
      submittedRef.current = true;
      onSubmit();
    }
  }, [isExpired, onSubmit]);

  // Session Lock error handler
  const handleSessionError = useCallback((error: any) => {
    const message = error?.message || error?.toString() || "";
    if (
      message.includes("thiết bị/tab khác") ||
      message.includes("another session") ||
      error?.status === "FORBIDDEN" ||
      error?.statusCode === 403
    ) {
      setIsSessionLocked(true);
      setSessionLockMessage(
        message ||
          "Bạn đang làm bài ở thiết bị/tab khác. Phiên làm bài này đã bị vô hiệu hóa.",
      );
    }
  }, []);

  const heartbeatMutationRef = useRef(heartbeatMutation);
  useEffect(() => {
    heartbeatMutationRef.current = heartbeatMutation;
  }, [heartbeatMutation]);

  const handleSessionErrorRef = useRef(handleSessionError);
  useEffect(() => {
    handleSessionErrorRef.current = handleSessionError;
  }, [handleSessionError]);

  // Heartbeat 45s Loop (isolated from re-renders)
  useEffect(() => {
    if (!attemptId || !sessionToken || isSessionLocked || isExpired) return;

    const sendHeartbeat = () => {
      heartbeatMutationRef.current.mutate(
        { attemptId, data: { sessionToken } },
        {
          onError: (err) => handleSessionErrorRef.current(err),
        },
      );
    };

    // Send initial heartbeat
    sendHeartbeat();

    const interval = setInterval(sendHeartbeat, 45000);
    return () => clearInterval(interval);
  }, [attemptId, sessionToken, isSessionLocked, isExpired]);

  // Trigger Autosave
  const sendAutosave = useCallback(
    (
      questionId: string,
      selectedOptionIds?: string[],
      answerText?: string | null,
    ) => {
      if (!attemptId || !sessionToken || isSessionLocked || isExpired) return;

      setAutosaveState("SAVING");
      const currentSeq = clientSeqRef.current++;

      const payload: AutosaveRequest = {
        questionId,
        selectedOptionIds,
        answerText: answerText || null,
        clientSeq: currentSeq,
        sessionToken,
      };

      autosaveMutation.mutate(
        { attemptId, data: payload },
        {
          onSuccess: (res) => {
            if (res && res.saved !== false) {
              setAutosaveState("SAVED");
            }
          },
          onError: (err) => {
            setAutosaveState("ERROR");
            handleSessionError(err);
          },
        },
      );
    },
    [
      attemptId,
      sessionToken,
      isSessionLocked,
      isExpired,
      autosaveMutation,
      handleSessionError,
    ],
  );

  // Update Answer for a single option selection (Single Choice)
  const updateSingleChoice = useCallback(
    (questionId: string, optionId: string) => {
      const newSelected = [optionId];
      setAnswersMap((prev) => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          selectedOptionIds: newSelected,
        },
      }));

      // Trigger Autosave
      sendAutosave(questionId, newSelected, answersMap[questionId]?.answerText);
    },
    [answersMap, sendAutosave],
  );

  // Update Answer for multiple choice (Toggle option)
  const updateMultipleChoice = useCallback(
    (questionId: string, optionId: string) => {
      setAnswersMap((prev) => {
        const currentOptions = prev[questionId]?.selectedOptionIds || [];
        const newOptions = currentOptions.includes(optionId)
          ? currentOptions.filter((id) => id !== optionId)
          : [...currentOptions, optionId];

        // Trigger Autosave
        sendAutosave(questionId, newOptions, prev[questionId]?.answerText);

        return {
          ...prev,
          [questionId]: {
            ...prev[questionId],
            selectedOptionIds: newOptions,
          },
        };
      });
    },
    [sendAutosave],
  );

  // Update Essay Answer with Debounce 400ms
  const updateEssayAnswer = useCallback(
    (questionId: string, text: string) => {
      setAnswersMap((prev) => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          answerText: text,
        },
      }));

      // Clear existing debounce timer for this question
      if (debouncedTimersRef.current[questionId]) {
        clearTimeout(debouncedTimersRef.current[questionId]);
      }

      // Set new debounce timer
      setAutosaveState("SAVING");
      debouncedTimersRef.current[questionId] = setTimeout(() => {
        sendAutosave(
          questionId,
          answersMap[questionId]?.selectedOptionIds,
          text,
        );
      }, 400);
    },
    [answersMap, sendAutosave],
  );

  return {
    sessionToken,
    isSessionLocked,
    sessionLockMessage,
    timeRemaining,
    isExpired,
    answersMap,
    autosaveState,
    updateSingleChoice,
    updateMultipleChoice,
    updateEssayAnswer,
  };
}
