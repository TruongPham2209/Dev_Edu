"use client";

import { EmptyState } from "@/components/common/empty-state";
import { CourseCard } from "@/components/course/course-card";
import { CoursePurchaseCard } from "@/components/course/course-purchase-card";
import { StudentCourseCatalog } from "@/components/student/course-catalog";
import { getCourseById, getCourseReviews, getCourses } from "@/lib/api/courses";
import { addToCart, getEnrollments } from "@/lib/api/enrollments";
import { getLecturesByCourse } from "@/lib/api/lectures";
import type {
  CourseResponse,
  LectureResponse,
  ReviewResponse,
} from "@/lib/api/types";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { useAuth } from "@/lib/use-auth";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Paper,
  Rating,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import {
  Award,
  BookOpen,
  ChevronDown,
  Clock,
  MessageSquare,
  Star,
  User,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CourseDetailPage() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id");
  const router = useRouter();
  const { handleError, showSuccess, toast } = useApiWithToast();
  const { isAuthenticated } = useAuth();

  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [lectures, setLectures] = useState<LectureResponse[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(false);

  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);

  const [relatedCourses, setRelatedCourses] = useState<CourseResponse[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  const [loadingAction, setLoadingAction] = useState<"buy" | "cart" | null>(
    null,
  );

  useEffect(() => {
    if (!courseId) return;

    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Course Detail
        let courseData: CourseResponse | null = null;
        try {
          courseData = await getCourseById(courseId);
        } catch {
          if (isMounted) {
            toast.error("Course does not exist");
            router.push("/courses");
            return;
          }
        }

        if (!isMounted) return;
        if (!courseData) {
          toast.error("Course does not exist");
          router.push("/courses");
          return;
        }
        setCourse(courseData);

        // 2. Lectures
        try {
          const lectureData = await getLecturesByCourse(courseId);
          if (isMounted) setLectures(lectureData);
        } catch {
          // Handle lecture load error quietly
        }

        // 3. Reviews
        setLoadingReviews(true);
        try {
          const reviewsData = await getCourseReviews(courseId);
          if (isMounted) {
            setReviews(reviewsData.contents || []);
            setNextCursor(reviewsData.nextCursor || null);
          }
        } catch (err) {
          console.error(err);
        } finally {
          if (isMounted) setLoadingReviews(false);
        }

        // 4. Related Courses
        setLoadingRelated(true);
        try {
          const coursesData = await getCourses();
          if (isMounted) {
            const filtered = (coursesData.contents || [])
              .filter((c) => c.id !== courseId)
              .slice(0, 3);
            setRelatedCourses(filtered);
          }
        } catch (err) {
          console.error(err);
        } finally {
          if (isMounted) setLoadingRelated(false);
        }

        // Enrollment
        if (isAuthenticated) {
          try {
            await getEnrollments();
            // TODO check actual enrollment status correctly based on data.
            setIsEnrolled(false);
          } catch {
            setIsEnrolled(false);
          }
        }
      } catch (error) {
        if (!isMounted) return;
        handleError(error, "Không thể tải khóa học");
        router.push("/courses");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();

    return () => {
      isMounted = false;
    };
  }, [courseId, router, isAuthenticated, toast, handleError]);

  const loadMoreReviews = async () => {
    if (!courseId || !nextCursor) return;
    setLoadingMoreReviews(true);
    try {
      const reviewsData = await getCourseReviews(courseId, nextCursor);
      setReviews((prev) => [...prev, ...(reviewsData.contents || [])]);
      setNextCursor(reviewsData.nextCursor || null);
    } catch (err) {
      handleError(err, "Không thể tải thêm đánh giá");
    } finally {
      setLoadingMoreReviews(false);
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/courses?id=${courseId}`);
      return;
    }
    router.push(`/checkout`);
  };

  const handleAddToCart = async () => {
    if (!course) return;
    setLoadingAction("cart");
    try {
      await addToCart(course.id);
      showSuccess("Đã thêm vào giỏ hàng");
    } catch (error) {
      handleError(error, "Không thể thêm vào giỏ hàng");
    } finally {
      setLoadingAction(null);
    }
  };

  if (!courseId) {
    return <StudentCourseCatalog />;
  }

  if (loading && !course) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Skeleton
              variant="rounded"
              height={300}
              sx={{ mb: 4, borderRadius: 4 }}
            />
            <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
            <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="80%" height={20} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rounded" height={400} sx={{ borderRadius: 4 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (!course) {
    return <EmptyState title="Không tìm thấy khóa học" />;
  }

  const isFree =
    course.originalPrice === 0 ||
    (course.discountedPercentage && course.discountedPercentage >= 100);
  const displayPrice =
    course.discountedPercentage && course.originalPrice
      ? course.originalPrice * (1 - course.discountedPercentage / 100)
      : course.originalPrice;

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "Đang cập nhật";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Đang cập nhật";
    return d.toLocaleDateString("vi-VN");
  };

  return (
    <Box
      sx={{
        bgcolor: "#f1f5f9",
        minHeight: "100vh",
        pb: 12,
        backgroundImage:
          "radial-gradient(circle at top center, rgba(255,255,255,1) 0%, rgba(241,245,249,1) 100%)",
        overflowX: "clip",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{ position: "relative", zIndex: 1, pt: { xs: 4, md: 6, lg: 8 } }}
      >
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 7, lg: 8 }}>
            {/* HERO TEXT WRAPPER WITH FULL-WIDTH BACKGROUND */}
            <Box
              sx={{
                position: "relative",
                color: "white",
                mb: { xs: 6, md: 8 },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: { xs: "-24px", md: "-40px" },
                  bottom: { xs: "-32px", md: "-48px" },
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "100vw",
                  background: "#020617",
                  zIndex: -1,
                  boxShadow:
                    "0 25px 50px -12px rgba(2, 6, 23, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
                },
              }}
            >
              {/* Layered glowing gradients using same dimensions */}
              <Box
                sx={{
                  position: "absolute",
                  top: { xs: "-24px", md: "-40px" },
                  bottom: { xs: "-32px", md: "-48px" },
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "100vw",
                  backgroundImage:
                    "radial-gradient(circle at 70% 0%, rgba(56, 189, 248, 0.15) 0%, transparent 50%), " +
                    "radial-gradient(circle at 20% 100%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), " +
                    "radial-gradient(circle at 50% 50%, rgba(2, 6, 23, 0) 0%, #020617 100%)",
                  pointerEvents: "none",
                  zIndex: -1,
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: { xs: "-24px", md: "-40px" },
                  bottom: { xs: "-32px", md: "-48px" },
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "100vw",
                  opacity: 0.25,
                  backgroundImage: `linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)`,
                  backgroundSize: `48px 48px`,
                  pointerEvents: "none",
                  maskImage:
                    "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
                  zIndex: -1,
                }}
              />

              <Box sx={{ position: "relative", zIndex: 1 }}>
                {/* Badges & Categories */}
                <Box
                  sx={{
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      bgcolor: "rgba(56, 189, 248, 0.1)",
                      color: "#38bdf8",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      borderRadius: "full",
                      border: "1px solid rgba(56, 189, 248, 0.2)",
                      backdropFilter: "blur(8px)",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        bgcolor: "#38bdf8",
                        boxShadow: "0 0 8px #38bdf8",
                      }}
                    />
                    Phát triển web
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      color: "#fbbf24",
                      bgcolor: "rgba(251, 191, 36, 0.1)",
                      px: 1.5,
                      py: 0.5,
                      borderRadius: "full",
                      border: "1px solid rgba(251, 191, 36, 0.2)",
                    }}
                  >
                    <Star size={14} fill="currentColor" />
                    <Typography sx={{ fontWeight: 700, fontSize: "0.875rem" }}>
                      4.8 Đánh giá cao
                    </Typography>
                  </Box>
                </Box>

                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 900,
                    mb: 2,
                    fontSize: { xs: "2rem", md: "2.75rem", lg: "3.25rem" },
                    lineHeight: 1.1,
                    letterSpacing: "-0.03em",
                    background:
                      "linear-gradient(to right, #ffffff 30%, #94a3b8 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    textShadow: "0 4px 32px rgba(255,255,255,0.1)",
                  }}
                >
                  {course.title}
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    color: "#cbd5e1",
                    mb: 4,
                    fontWeight: 400,
                    lineHeight: 1.6,
                    fontSize: { xs: "1rem", md: "1.125rem" },
                    maxWidth: "95%",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {course.description}
                </Typography>

                {/* High-tech Metadata Grid */}
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: { xs: 1.5, md: 3 },
                    mb: 4,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      bgcolor: "rgba(255,255,255,0.02)",
                      p: 1.5,
                      borderRadius: 3,
                      border: "1px solid rgba(255,255,255,0.05)",
                      backdropFilter: "blur(12px)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.25,
                        bgcolor: "rgba(56, 189, 248, 0.1)",
                        borderRadius: 2,
                        color: "#38bdf8",
                      }}
                    >
                      <User size={20} />
                    </Box>
                    <Box>
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          color: "#94a3b8",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          mb: 0.25,
                        }}
                      >
                        Học viên
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: "1rem",
                          color: "white",
                        }}
                      >
                        12,456
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      bgcolor: "rgba(255,255,255,0.02)",
                      p: 1.5,
                      borderRadius: 3,
                      border: "1px solid rgba(255,255,255,0.05)",
                      backdropFilter: "blur(12px)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.25,
                        bgcolor: "rgba(167, 139, 250, 0.1)",
                        borderRadius: 2,
                        color: "#a78bfa",
                      }}
                    >
                      <Clock size={20} />
                    </Box>
                    <Box>
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          color: "#94a3b8",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          mb: 0.25,
                        }}
                      >
                        Cập nhật
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: "1rem",
                          color: "white",
                        }}
                      >
                        {formatDate(course.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Sleek Instructor Card */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 2,
                    bgcolor: "rgba(15, 23, 42, 0.6)",
                    borderRadius: 4,
                    border: "1px solid rgba(255,255,255,0.1)",
                    width: "fit-content",
                    boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",
                    backdropFilter: "blur(16px)",
                  }}
                >
                  <AvatarGroup max={4} sx={{
                    '& .MuiAvatar-root': {
                      width: 48,
                      height: 48,
                      background: "linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)",
                      fontWeight: 800,
                      fontSize: "1.125rem",
                      border: "2px solid rgba(15, 23, 42, 0.8)",
                      color: "white",
                    }
                  }}>
                    {course.lecturers && course.lecturers.length > 0 ? (
                      course.lecturers.map((lecturer) => (
                        <Avatar key={lecturer}>
                          {lecturer.charAt(0).toUpperCase()}
                        </Avatar>
                      ))
                    ) : (
                      <Avatar>G</Avatar>
                    )}
                  </AvatarGroup>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.875rem",
                        color: "#94a3b8",
                        mb: 0.25,
                        fontWeight: 500,
                      }}
                    >
                      Giảng viên chuyên môn
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: "1.125rem",
                        color: "white",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {course.lecturers && course.lecturers.length > 0
                        ? course.lecturers.join(", ")
                        : "Đang cập nhật"}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* MOBILE ONLY: Purchase Card stacks perfectly below Hero content */}
            <Box sx={{ display: { xs: "block", md: "none" }, mb: 6 }}>
              <CoursePurchaseCard
                course={course}
                isEnrolled={isEnrolled}
                lectures={lectures}
                handleBuyNow={handleBuyNow}
                handleAddToCart={handleAddToCart}
                loadingAction={loadingAction}
              />
            </Box>

            {/* MAIN CONTENT (Lectures & Reviews) */}
            <Box sx={{ pb: 4 }}>
              <Stack spacing={8}>
                {/* LECTURES SECTION */}
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 4,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: "#eff6ff",
                        borderRadius: 3,
                        color: "#2563eb",
                      }}
                    >
                      <BookOpen size={28} />
                    </Box>
                    <Box>
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 800, color: "#0f172a" }}
                      >
                        Nội dung khóa học
                      </Typography>
                      <Typography sx={{ color: "#64748b", mt: 0.5 }}>
                        Lộ trình học tập chi tiết được thiết kế bài bản
                      </Typography>
                    </Box>
                  </Box>

                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: "1px solid #e2e8f0",
                      overflow: "hidden",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: "#f8fafc",
                        px: 3,
                        py: 2.5,
                        borderBottom: "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 800,
                          color: "#1e293b",
                          fontSize: "1.125rem",
                        }}
                      >
                        Tổng cộng {lectures.length} bài giảng
                      </Typography>
                    </Box>

                    {lectures.length === 0 ? (
                      <Box sx={{ p: 6, textAlign: "center" }}>
                        <Typography sx={{ color: "#64748b" }}>
                          Chưa có bài giảng nào được cập nhật.
                        </Typography>
                      </Box>
                    ) : (
                      <Stack divider={<Divider />}>
                        {lectures.map((lecture, index) => (
                          <Accordion
                            key={lecture.id}
                            disableGutters
                            elevation={0}
                            sx={{
                              "&:before": { display: "none" },
                              bgcolor: "transparent",
                              "&.Mui-expanded": {
                                bgcolor: "#f8fafc",
                              },
                              transition: "all 0.2s ease",
                              "&:hover": {
                                bgcolor: "#f8fafc",
                              },
                            }}
                          >
                            <AccordionSummary
                              expandIcon={
                                <ChevronDown size={20} color="#64748b" />
                              }
                              sx={{
                                px: 3,
                                py: 1.5,
                                "& .MuiAccordionSummary-content": { my: 0 },
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2.5,
                                  width: "100%",
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: "50%",
                                    bgcolor: "#e0e7ff",
                                    color: "#4f46e5",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 700,
                                    fontSize: "0.875rem",
                                    flexShrink: 0,
                                  }}
                                >
                                  {index + 1}
                                </Box>
                                <Typography
                                  sx={{
                                    fontWeight: 600,
                                    color: "#1e293b",
                                    fontSize: "1rem",
                                  }}
                                >
                                  {lecture.title}
                                </Typography>
                              </Box>
                            </AccordionSummary>
                            <AccordionDetails sx={{ px: 3, pb: 4, pt: 0 }}>
                              <Box sx={{ pl: 7 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: "#64748b",
                                    lineHeight: 1.7,
                                    fontSize: "0.95rem",
                                  }}
                                >
                                  {lecture.summary ||
                                    "Chưa có mô tả chi tiết cho bài giảng này. Học viên có thể xem trực tiếp video bài giảng để nắm nội dung."}
                                </Typography>
                              </Box>
                            </AccordionDetails>
                          </Accordion>
                        ))}
                      </Stack>
                    )}
                  </Paper>
                </Box>

                {/* REVIEWS SECTION */}
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 4,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: "#fef3c7",
                        borderRadius: 3,
                        color: "#d97706",
                      }}
                    >
                      <MessageSquare size={28} />
                    </Box>
                    <Box>
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 800, color: "#0f172a" }}
                      >
                        Đánh giá từ học viên
                      </Typography>
                      <Typography sx={{ color: "#64748b", mt: 0.5 }}>
                        Cộng đồng học viên nói gì về khóa học này?
                      </Typography>
                    </Box>
                  </Box>

                  {/* Review Summary Card */}
                  <Paper
                    elevation={0}
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 4,
                      mb: 4,
                      p: 4,
                      borderRadius: 3,
                      border: "1px solid #e2e8f0",
                      alignItems: "center",
                      bgcolor: "white",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
                    }}
                  >
                    <Box
                      sx={{
                        textAlign: "center",
                        pr: { xs: 0, sm: 4 },
                        borderRight: { xs: "none", sm: "1px solid #e2e8f0" },
                        width: { xs: "100%", sm: "auto" },
                      }}
                    >
                      <Typography
                        variant="h2"
                        sx={{ fontWeight: 900, color: "#0f172a", mb: 1 }}
                      >
                        4.8
                      </Typography>
                      <Rating
                        value={4.8}
                        readOnly
                        precision={0.1}
                        size="large"
                        sx={{ color: "#fbbf24" }}
                      />
                      <Typography
                        sx={{ color: "#64748b", mt: 1, fontWeight: 500 }}
                      >
                        {reviews.length || "1,234"} đánh giá
                      </Typography>
                    </Box>
                    <Box
                      sx={{ flex: 1, textAlign: { xs: "center", sm: "left" } }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 800, mb: 1, color: "#1e293b" }}
                      >
                        Khóa học được đánh giá rất cao!
                      </Typography>
                      <Typography sx={{ color: "#475569", lineHeight: 1.6 }}>
                        Hầu hết học viên đều hài lòng với chất lượng giảng dạy
                        và tính ứng dụng thực tế của khóa học này.
                      </Typography>
                    </Box>
                  </Paper>

                  {loadingReviews ? (
                    <Stack spacing={3}>
                      {[1, 2, 3].map((i) => (
                        <Box key={i} sx={{ display: "flex", gap: 2 }}>
                          <Skeleton variant="circular" width={48} height={48} />
                          <Box sx={{ flex: 1 }}>
                            <Skeleton
                              variant="text"
                              width="20%"
                              height={24}
                              sx={{ mb: 1 }}
                            />
                            <Skeleton
                              variant="text"
                              width="15%"
                              height={20}
                              sx={{ mb: 2 }}
                            />
                            <Skeleton variant="text" width="100%" height={60} />
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  ) : reviews.length === 0 ? (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 6,
                        textAlign: "center",
                        borderRadius: 3,
                        border: "1px dashed #cbd5e1",
                        bgcolor: "rgba(248, 250, 252, 0.5)",
                      }}
                    >
                      <Typography sx={{ color: "#64748b", fontWeight: 500 }}>
                        Khóa học này chưa có đánh giá nào. Hãy là người đầu
                        tiên!
                      </Typography>
                    </Paper>
                  ) : (
                    <Stack spacing={3}>
                      {reviews.map((review) => (
                        <Paper
                          key={review.id}
                          elevation={0}
                          sx={{
                            p: 4,
                            borderRadius: 3,
                            border: "1px solid #e2e8f0",
                            bgcolor: "white",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              borderColor: "#cbd5e1",
                              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
                              transform: "translateY(-2px)",
                            },
                          }}
                        >
                          <Box sx={{ display: "flex", gap: 3 }}>
                            <Avatar
                              sx={{
                                bgcolor: "#38bdf8",
                                width: 56,
                                height: 56,
                                fontWeight: 700,
                                fontSize: "1.25rem",
                              }}
                            >
                              {(review.username || "H").charAt(0).toUpperCase()}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                  mb: 1,
                                }}
                              >
                                <Box>
                                  <Typography
                                    sx={{
                                      fontWeight: 800,
                                      color: "#0f172a",
                                      fontSize: "1.125rem",
                                      mb: 0.5,
                                    }}
                                  >
                                    {review.username || "Học viên ẩn danh"}
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1.5,
                                    }}
                                  >
                                    <Rating
                                      value={review.rating}
                                      readOnly
                                      size="small"
                                      sx={{ color: "#fbbf24" }}
                                    />
                                    <Typography
                                      sx={{
                                        fontSize: "0.875rem",
                                        color: "#94a3b8",
                                        fontWeight: 500,
                                      }}
                                    >
                                      {formatDate(review.createdAt)}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                              <Typography
                                sx={{
                                  color: "#475569",
                                  lineHeight: 1.7,
                                  mt: 2,
                                  fontSize: "1rem",
                                }}
                              >
                                {review.comment}
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      ))}

                      {nextCursor && (
                        <Box sx={{ textAlign: "center", mt: 4 }}>
                          <Button
                            variant="outlined"
                            onClick={loadMoreReviews}
                            disabled={loadingMoreReviews}
                            sx={{
                              borderRadius: 20,
                              px: 6,
                              py: 1.5,
                              textTransform: "none",
                              fontWeight: 700,
                              fontSize: "1rem",
                              borderWidth: 2,
                              borderColor: "#cbd5e1",
                              color: "#475569",
                              "&:hover": {
                                borderWidth: 2,
                                borderColor: "#64748b",
                                bgcolor: "#f8fafc",
                              },
                            }}
                          >
                            {loadingMoreReviews
                              ? "Đang tải thêm..."
                              : "Xem thêm đánh giá"}
                          </Button>
                        </Box>
                      )}
                    </Stack>
                  )}
                </Box>

                {/* RELATED COURSES */}
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 4,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: "#f3e8ff",
                        borderRadius: 3,
                        color: "#9333ea",
                      }}
                    >
                      <Award size={28} />
                    </Box>
                    <Box>
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 800, color: "#0f172a" }}
                      >
                        Khóa học liên quan
                      </Typography>
                      <Typography sx={{ color: "#64748b", mt: 0.5 }}>
                        Có thể bạn cũng sẽ quan tâm
                      </Typography>
                    </Box>
                  </Box>

                  {loadingRelated ? (
                    <Grid container spacing={3}>
                      {[1, 2, 3].map((i) => (
                        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }} key={i}>
                          <Skeleton
                            variant="rounded"
                            height={320}
                            sx={{ borderRadius: 4 }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  ) : relatedCourses.length === 0 ? (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        textAlign: "center",
                        borderRadius: 3,
                        bgcolor: "rgba(248, 250, 252, 0.5)",
                      }}
                    >
                      <Typography sx={{ color: "#64748b" }}>
                        Chưa có khóa học liên quan.
                      </Typography>
                    </Paper>
                  ) : (
                    <Grid container spacing={3}>
                      {relatedCourses.map((relatedCourse) => (
                        <Grid
                          size={{ xs: 12, sm: 6, md: 6, lg: 4 }}
                          key={relatedCourse.id}
                        >
                          <CourseCard course={relatedCourse} />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              </Stack>
            </Box>
          </Grid>

          {/* DESKTOP ONLY: RIGHT STICKY COLUMN */}
          <Grid
            size={{ xs: 12, md: 5, lg: 4 }}
            sx={{
              display: { xs: "none", md: "block" },
              position: "sticky",
              top: 100,
              alignSelf: "flex-start",
              zIndex: 100,
            }}
          >
            <CoursePurchaseCard
              course={course}
              isEnrolled={isEnrolled}
              lectures={lectures}
              handleBuyNow={handleBuyNow}
              handleAddToCart={handleAddToCart}
              loadingAction={loadingAction}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
