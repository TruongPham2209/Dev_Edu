"use client";

import { InfoDialog } from "@/components/common/info-dialog";
import type { AttemptQuestionResultDto } from "@/lib/type/quizzes";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Check,
  CheckCircle2,
  Clock,
  Eye,
  HelpCircle,
  MessageSquare,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";

export interface QuestionResultCardProps {
  question: AttemptQuestionResultDto;
  index: number;
  isGraded?: boolean;
}

export function QuestionResultCard({
  question: q,
  index: idx,
  isGraded = true,
}: QuestionResultCardProps) {
  const theme = useTheme();
  const [openDetail, setOpenDetail] = useState(false);

  const isEssay = q.questionType === "ESSAY";
  const isCorrect = q.isCorrect;
  const questionContent = q.questionContent || (q as any).content || "";
  const points = q.questionPoints ?? (q as any).points ?? 0;
  const awarded = q.awardedPoints ?? 0;

  let statusBorderColor = "divider";

  if (!isEssay) {
    if (isCorrect === true) {
      statusBorderColor = "success.main";
    } else if (isCorrect === false) {
      statusBorderColor = "error.main";
    }
  } else if (awarded > 0) {
    statusBorderColor = "success.main";
  } else if (isGraded && awarded === 0) {
    statusBorderColor = "error.main";
  }

  return (
    <>
      <Card
        variant="outlined"
        onClick={() => setOpenDetail(true)}
        sx={{
          borderRadius: 1,
          border: 1,
          borderColor: statusBorderColor,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            transform: "translateY(-2px)",
          },
        }}
      >
        <CardContent
          sx={{
            p: 2.5,
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
          }}
        >
          {/* Card Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={`Q${idx + 1}`}
                color="primary"
                size="small"
                sx={{ fontWeight: 800, height: 22 }}
              />
              <Chip
                label={
                  q.questionType === "SINGLE_CHOICE"
                    ? "Single"
                    : q.questionType === "MULTIPLE_CHOICE"
                      ? "Multiple"
                      : "Essay"
                }
                variant="outlined"
                size="small"
                sx={{ height: 22, fontSize: "0.7rem" }}
              />
            </Box>

            {/* Question Result Status Icon */}
            {!isEssay ? (
              isCorrect === true ? (
                <Chip
                  icon={<Check size={14} color="#16a34a" />}
                  label="Correct"
                  color="success"
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 700, height: 22 }}
                />
              ) : (
                <Chip
                  icon={<X size={14} color="#dc2626" />}
                  label="Wrong"
                  color="error"
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 700, height: 22 }}
                />
              )
            ) : awarded > 0 ? (
              <Chip
                icon={<Check size={14} color="#16a34a" />}
                label="Passed"
                color="success"
                size="small"
                variant="outlined"
                sx={{ fontWeight: 700, height: 22 }}
              />
            ) : (
              <Chip
                icon={<Clock size={14} color="#d97706" />}
                label="Essay"
                color="warning"
                size="small"
                variant="outlined"
                sx={{ fontWeight: 700, height: 22 }}
              />
            )}
          </Box>

          {/* Question Points */}
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: awarded > 0 ? "success.main" : "text.secondary",
              mb: 1.5,
              display: "block",
            }}
          >
            Score: {awarded} / {points} pts
          </Typography>

          {/* Question Text - Truncated to 2 lines */}
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              mb: 2,
              flexGrow: 1,
              lineHeight: 1.5,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
            dangerouslySetInnerHTML={{ __html: questionContent }}
          />

          <Divider sx={{ my: 1.5 }} />

          {/* Options List for Single & Multiple Choice (Truncated) */}
          {!isEssay && q.options && (
            <Stack spacing={1}>
              {q.options.slice(0, 4).map((opt: any) => {
                const isUserSelected = q.selectedOptionIds?.includes(opt.id);
                const isCorrectOption =
                  (q as any).correctOptionIds?.includes(opt.id) ||
                  opt.isCorrect;

                let optionBg = "background.paper";
                let optionBorder = "divider";
                let textColor = "text.primary";
                let borderStyle = "solid";
                let borderWidth = 1;

                if (isUserSelected && isCorrectOption) {
                  optionBg = alpha(theme.palette.success.main, 0.12);
                  optionBorder = "success.main";
                  textColor = "success.dark";
                  borderWidth = 1.5;
                } else if (isUserSelected && !isCorrectOption) {
                  optionBg = alpha(theme.palette.error.main, 0.1);
                  optionBorder = "error.main";
                  textColor = "error.dark";
                  borderWidth = 1.5;
                } else if (!isUserSelected && isCorrectOption) {
                  optionBg = alpha(theme.palette.success.main, 0.04);
                  optionBorder = "success.main";
                  textColor = "success.dark";
                  borderStyle = "dashed";
                }

                return (
                  <Paper
                    key={opt.id}
                    variant="outlined"
                    sx={{
                      p: 1.25,
                      borderRadius: 1,
                      bgcolor: optionBg,
                      borderColor: optionBorder,
                      borderStyle: borderStyle,
                      borderWidth: borderWidth,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        overflow: "hidden",
                        flex: 1,
                      }}
                    >
                      {isUserSelected && isCorrectOption && (
                        <CheckCircle2
                          size={16}
                          color="#16a34a"
                          style={{ flexShrink: 0 }}
                        />
                      )}
                      {isUserSelected && !isCorrectOption && (
                        <XCircle
                          size={16}
                          color="#dc2626"
                          style={{ flexShrink: 0 }}
                        />
                      )}
                      {!isUserSelected && isCorrectOption && (
                        <Check
                          size={16}
                          color="#16a34a"
                          style={{ flexShrink: 0 }}
                        />
                      )}
                      {!isUserSelected && !isCorrectOption && (
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            border: "1px solid",
                            borderColor: "divider",
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight:
                            isCorrectOption || isUserSelected ? 700 : 400,
                          color: textColor,
                          fontSize: "0.825rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {opt.optionText}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                      {isUserSelected && isCorrectOption && (
                        <Chip
                          label="Your Choice ✓"
                          color="success"
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.65rem",
                            fontWeight: 700,
                          }}
                        />
                      )}
                      {isUserSelected && !isCorrectOption && (
                        <Chip
                          label="Your Choice ✗"
                          color="error"
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.65rem",
                            fontWeight: 700,
                          }}
                        />
                      )}
                      {!isUserSelected && isCorrectOption && (
                        <Chip
                          label="Correct Answer"
                          color="success"
                          variant="outlined"
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.65rem",
                            fontWeight: 700,
                          }}
                        />
                      )}
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          )}

          {/* Essay Section (Truncated) */}
          {isEssay && (
            <Box sx={{ mt: 1 }}>
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: "action.hover",
                  borderRadius: 0.5,
                  mb: 1.5,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontWeight: 600,
                    display: "block",
                    mb: 0.5,
                  }}
                >
                  Your answer:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "0.825rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {q.answerText || "(No answer provided)"}
                </Typography>
              </Box>

              {q.feedback && (
                <Alert
                  severity="info"
                  icon={<MessageSquare size={16} />}
                  sx={{ borderRadius: 2, py: 0.5, px: 1.5 }}
                >
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, display: "block" }}
                  >
                    Instructor Feedback:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "0.825rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {q.feedback}
                  </Typography>
                </Alert>
              )}
            </Box>
          )}

          {/* Click Detail Indicator */}
          <Box
            sx={{
              mt: "auto",
              pt: 1.5,
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "primary.main",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <Eye size={13} /> View Details
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Full Detail InfoDialog */}
      <InfoDialog
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        title={`Question ${idx + 1} Details`}
        headerIcon={<HelpCircle size={20} color="#2563eb" />}
        maxWidth="md"
      >
        <Box sx={{ p: { xs: 0, sm: 1 } }}>
          {/* Header Badges & Points */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2.5,
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={`Q${idx + 1}`}
                color="primary"
                size="small"
                sx={{ fontWeight: 800, height: 22 }}
              />
              <Chip
                label={
                  q.questionType === "SINGLE_CHOICE"
                    ? "Single Choice"
                    : q.questionType === "MULTIPLE_CHOICE"
                      ? "Multiple Choice"
                      : "Essay Question"
                }
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
              {!isEssay ? (
                isCorrect === true ? (
                  <Chip
                    icon={<Check size={14} color="#16a34a" />}
                    label="Correct"
                    color="success"
                    variant="outlined"
                    sx={{ fontWeight: 700 }}
                  />
                ) : (
                  <Chip
                    icon={<X size={14} color="#dc2626" />}
                    label="Wrong"
                    color="error"
                    variant="outlined"
                    sx={{ fontWeight: 700 }}
                  />
                )
              ) : awarded > 0 ? (
                <Chip
                  icon={<Check size={14} color="#16a34a" />}
                  label="Passed"
                  color="success"
                  variant="outlined"
                  sx={{ fontWeight: 700 }}
                />
              ) : (
                <Chip
                  icon={<Clock size={14} color="#d97706" />}
                  label="Essay"
                  color="warning"
                  variant="outlined"
                  sx={{ fontWeight: 700 }}
                />
              )}
            </Box>

            <Chip
              label={`Score: ${awarded} / ${points} pts`}
              color={awarded > 0 ? "success" : "default"}
              sx={{ fontWeight: 800, fontSize: "0.9rem" }}
            />
          </Box>

          {/* Full Question Text */}
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              mb: 3,
              borderRadius: 2,
              bgcolor: "grey.50",
              borderLeft: "4px solid",
              borderColor: "primary.main",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: "primary.main",
                textTransform: "uppercase",
                display: "block",
                mb: 1,
              }}
            >
              Question Prompt
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, lineHeight: 1.6 }}
              dangerouslySetInnerHTML={{ __html: questionContent }}
            />
          </Paper>

          {/* Options List (Full, Un-truncated) */}
          {!isEssay && q.options && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                Options & Answers breakdown
              </Typography>
              <Stack spacing={1.5}>
                {q.options.map((opt: any) => {
                  const isUserSelected = q.selectedOptionIds?.includes(opt.id);
                  const isCorrectOption =
                    (q as any).correctOptionIds?.includes(opt.id) ||
                    opt.isCorrect;

                  let optionBg = "background.paper";
                  let optionBorder = "divider";
                  let textColor = "text.primary";
                  let borderStyle = "solid";
                  let borderWidth = 1;

                  if (isUserSelected && isCorrectOption) {
                    optionBg = alpha(theme.palette.success.main, 0.12);
                    optionBorder = "success.main";
                    textColor = "success.dark";
                    borderWidth = 2;
                  } else if (isUserSelected && !isCorrectOption) {
                    optionBg = alpha(theme.palette.error.main, 0.1);
                    optionBorder = "error.main";
                    textColor = "error.dark";
                    borderWidth = 2;
                  } else if (!isUserSelected && isCorrectOption) {
                    optionBg = alpha(theme.palette.success.main, 0.04);
                    optionBorder = "success.main";
                    textColor = "success.dark";
                    borderStyle = "dashed";
                    borderWidth = 1.5;
                  }

                  return (
                    <Paper
                      key={opt.id}
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 1.5,
                        bgcolor: optionBg,
                        borderColor: optionBorder,
                        borderStyle: borderStyle,
                        borderWidth: borderWidth,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          flex: 1,
                        }}
                      >
                        {isUserSelected && isCorrectOption && (
                          <CheckCircle2
                            size={20}
                            color="#16a34a"
                            style={{ flexShrink: 0, marginTop: 2 }}
                          />
                        )}
                        {isUserSelected && !isCorrectOption && (
                          <XCircle
                            size={16}
                            color="#dc2626"
                            style={{ flexShrink: 0, marginTop: 2 }}
                          />
                        )}
                        {!isUserSelected && isCorrectOption && (
                          <Check
                            size={16}
                            color="#16a34a"
                            style={{ flexShrink: 0, marginTop: 2 }}
                          />
                        )}
                        {!isUserSelected && !isCorrectOption && (
                          <Box
                            sx={{
                              width: 14,
                              height: 14,
                              borderRadius: "50%",
                              border: "1px solid",
                              borderColor: "divider",
                              flexShrink: 0,
                              mt: 0.25,
                            }}
                          />
                        )}
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight:
                              isCorrectOption || isUserSelected ? 700 : 500,
                            color: textColor,
                            fontSize: { xs: "0.825rem", sm: "0.875rem" },
                            lineHeight: 1.45,
                          }}
                        >
                          {opt.optionText}
                        </Typography>
                      </Box>

                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{
                          flexShrink: 0,
                          alignSelf: { xs: "flex-end", sm: "center" },
                        }}
                      >
                        {isUserSelected && isCorrectOption && (
                          <Chip
                            label="Your Choice ✓"
                            color="success"
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontSize: "0.675rem",
                              height: 20,
                            }}
                          />
                        )}
                        {isUserSelected && !isCorrectOption && (
                          <Chip
                            label="Your Choice ✗"
                            color="error"
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontSize: "0.675rem",
                              height: 20,
                            }}
                          />
                        )}
                        {!isUserSelected && isCorrectOption && (
                          <Chip
                            label="Correct Answer"
                            color="success"
                            variant="outlined"
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontSize: "0.675rem",
                              height: 20,
                            }}
                          />
                        )}
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            </Box>
          )}

          {/* Full Essay Answer & Feedback */}
          {isEssay && (
            <Box sx={{ mt: 1.5 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, mb: 0.75, fontSize: "0.85rem" }}
              >
                Student's Essay Response
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: { xs: 1.25, sm: 1.75 },
                  bgcolor: "background.paper",
                  borderRadius: 1.5,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  mb: 1.75,
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    lineHeight: 1.6,
                    fontSize: { xs: "0.85rem", sm: "0.925rem" },
                  }}
                >
                  {q.answerText || "(No answer text submitted)"}
                </Typography>
              </Paper>

              {q.feedback && (
                <Alert
                  severity="info"
                  icon={<MessageSquare size={18} />}
                  sx={{ borderRadius: 1.5, p: { xs: 1.25, sm: 1.5 } }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, mb: 0.25, fontSize: "0.825rem" }}
                  >
                    Instructor Feedback:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      lineHeight: 1.5,
                      fontSize: { xs: "0.825rem", sm: "0.875rem" },
                    }}
                  >
                    {q.feedback}
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
        </Box>
      </InfoDialog>
    </>
  );
}
