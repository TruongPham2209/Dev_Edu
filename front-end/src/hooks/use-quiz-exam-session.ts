"use client";

import {
  useAutosaveAttemptMutation,
  useHeartbeatAttemptMutation,
} from "@/lib/api/quizzes";
import type { AutosaveRequest, StudentAnswerDto } from "@/lib/type/quizzes";
import { parseServerDate } from "@/lib/util/date-utils";
import { useCallback, useEffect, useRef, useState } from "react";

export interface UseQuizExamSessionProps {
  attemptId: string;
  expiresAt: string;
  initialAnswers?: StudentAnswerDto[];
  activeSessionToken?: string;
  onSubmit: () => void;
}

export type AutosaveState = "SAVED" | "SAVING" | "ERROR";

export function parseTargetExpiryTime(expiresAt: unknown): number {
  if (!expiresAt) return 0;
  const d = parseServerDate(expiresAt);
  const t = d.getTime();
  return isNaN(t) ? 0 : t;
}

export function useQuizExamSession({
  attemptId,
  expiresAt,
  initialAnswers = [],
  activeSessionToken,
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
      if (ans && ans.questionId) {
        initial[ans.questionId] = {
          selectedOptionIds: ans.selectedOptionIds || [],
          answerText: ans.answerText || undefined,
        };
      }
    });
    return initial;
  });

  // Sync initialAnswers into answersMap when loaded asynchronously
  useEffect(() => {
    if (!initialAnswers || initialAnswers.length === 0) return;

    setAnswersMap((prevMap) => {
      const nextMap = { ...prevMap };
      let hasChanges = false;

      initialAnswers.forEach((ans) => {
        if (!ans || !ans.questionId) return;
        const current = nextMap[ans.questionId];

        if (
          !current ||
          (!current.selectedOptionIds?.length && !current.answerText)
        ) {
          nextMap[ans.questionId] = {
            selectedOptionIds: ans.selectedOptionIds || [],
            answerText: ans.answerText || undefined,
          };
          hasChanges = true;
        }
      });

      return hasChanges ? nextMap : prevMap;
    });
  }, [initialAnswers]);

  // Sequence counter for Autosave
  const clientSeqRef = useRef<number>(1);
  const [autosaveState, setAutosaveState] = useState<AutosaveState>("SAVED");
  const debouncedTimersRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Initialize & Sync Session Token
  useEffect(() => {
    if (!attemptId) return;

    const storageKey = `quiz_session_token_${attemptId}`;

    // 1. If backend returned an explicit activeSessionToken, use it as source of truth
    if (activeSessionToken) {
      localStorage.setItem(storageKey, activeSessionToken);
      sessionStorage.setItem(storageKey, activeSessionToken);
      setSessionToken(activeSessionToken);
      return;
    }

    // 2. Fallback to localStorage / sessionStorage if available
    let token =
      localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey);
    if (!token) {
      token = crypto.randomUUID
        ? crypto.randomUUID()
        : `token_${Date.now()}_${Math.random()}`;
      localStorage.setItem(storageKey, token);
      sessionStorage.setItem(storageKey, token);
    }
    setSessionToken(token);
  }, [attemptId, activeSessionToken]);

  // Countdown Timer Effect
  useEffect(() => {
    if (!expiresAt) return;

    const targetTime = parseTargetExpiryTime(expiresAt);
    if (targetTime <= 0) return;

    const updateTimer = () => {
      const now = Date.now();
      const rawDiff = Math.floor((targetTime - now) / 1000);
      const diff = isNaN(rawDiff) ? 0 : Math.max(0, rawDiff);
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
      message.includes("You are taking the test on another device/tab.") ||
      message.includes("You are attempting this test in another session") ||
      message.includes("another session") ||
      error?.status === "FORBIDDEN" ||
      error?.statusCode === 403
    ) {
      setIsSessionLocked(true);
      setSessionLockMessage(
        message || "You are taking this test on another device/tab.",
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
