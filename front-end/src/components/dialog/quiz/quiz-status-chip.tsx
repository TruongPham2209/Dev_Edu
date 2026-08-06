"use client";

import type {
  AssignmentStatus,
  AttemptStatus,
  QuizStatus,
} from "@/lib/type/quizzes";
import { Chip, ChipProps } from "@mui/material";

interface QuizStatusChipProps extends Omit<ChipProps, "color"> {
  status: QuizStatus | AttemptStatus | AssignmentStatus | string;
}

export function QuizStatusChip({ status, ...props }: QuizStatusChipProps) {
  let label = status as string;
  let color: ChipProps["color"] = "default";

  switch (status) {
    case "DRAFT":
      label = "Draft";
      color = "default";
      break;
    case "PENDING":
      label = "Pending";
      color = "warning";
      break;
    case "APPROVED":
      label = "Approved";
      color = "success";
      break;
    case "REJECTED":
      label = "Rejected";
      color = "error";
      break;

    // Attempt statuses
    case "IN_PROGRESS":
      label = "In progress";
      color = "info";
      break;
    case "SUBMITTED":
      label = "Submitted";
      color = "primary";
      break;
    case "GRADING":
      label = "Pending auto-grading";
      color = "warning";
      break;
    case "GRADED":
      label = "Graded";
      color = "success";
      break;
    case "EXPIRED":
      label = "Expired";
      color = "error";
      break;

    // Assignment statuses
    case "SCHEDULED":
      label = "Scheduled";
      color = "info";
      break;
    case "ACTIVE":
      label = "Active";
      color = "success";
      break;
    case "CLOSED":
      label = "Closed";
      color = "default";
      break;
    default:
      label = status;
      color = "default";
  }

  return (
    <Chip
      label={label}
      color={color}
      size="small"
      sx={{ fontWeight: 600, borderRadius: 1.5, ...props.sx }}
      {...props}
    />
  );
}
