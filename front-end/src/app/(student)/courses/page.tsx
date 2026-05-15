"use client";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  addToCart,
  createPurchase,
  getEnrollments,
} from "@/lib/api/enrollments";
import { getCourseById } from "@/lib/api/courses";
import { getLecturesByCourse } from "@/lib/api/lectures";
import type { CourseDetailProjection, LectureResponse } from "@/lib/api/types";
import { EmptyState } from "@/components/common/empty-state";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import Link from "next/link";
import { StudentCourseCatalog } from "@/components/student/course-catalog";

export default function CourseDetailPage() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id");
  const { handleError, showSuccess } = useApiWithToast();
  const [course, setCourse] = useState<CourseDetailProjection | null>(null);
  const [lectures, setLectures] = useState<LectureResponse[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!courseId) {
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const [courseData, lectureData] = await Promise.all([
          getCourseById(courseId),
          getLecturesByCourse(courseId),
        ]);
        setCourse(courseData);
        setLectures(lectureData);
        // Check enrollment - best effort
        try {
          await getEnrollments();
          setIsEnrolled(false); // TODO: check actual enrollment status
        } catch {
          setIsEnrolled(false);
        }
      } catch (error) {
        handleError(error, "Không thể tải khóa học");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId, handleError]);

  if (!courseId) {
    return <StudentCourseCatalog />;
  }

  if (loading && !course) {
    return (
      <Stack spacing={2}>
        <Skeleton height={48} width="60%" />
        <Skeleton height={20} width="80%" />
        <Skeleton height={120} />
      </Stack>
    );
  }

  if (!course) {
    return <EmptyState title="Không tìm thấy khóa học" />;
  }



  const handleBuyNow = async () => {
    try {
      const response = await createPurchase({
        entityIds: [course.id],
        entityType: "COURSE",
        paymentMethod: "VNPAY",
      });
      if (response.paymentUrl) {
        window.location.href = response.paymentUrl;
      }
    } catch (error) {
      handleError(error, "Không thể tạo đơn hàng");
    }
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(course.id);
      showSuccess("Đã thêm vào giỏ hàng");
    } catch (error) {
      handleError(error, "Không thể thêm vào giỏ hàng");
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          {course.title}
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          {course.description}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
        {isEnrolled ? (
          <Button
            component={Link}
            href={`/courses/${course.id}/lectures`}
            variant="contained"
          >
            Learn Now
          </Button>
        ) : (
          <>
            <Button variant="contained" onClick={handleBuyNow}>
              Buy Now
            </Button>
            <Button variant="outlined" onClick={handleAddToCart}>
              Add to Cart
            </Button>
          </>
        )}
      </Box>

      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          Danh sách bài giảng
        </Typography>
        {lectures.length === 0 ? (
          <EmptyState title="Chưa có bài giảng" />
        ) : (
          <Stack spacing={1.5}>
            {lectures.map((lecture) => (
              <Accordion key={lecture.id} disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 600 }}>
                    {lecture.title}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {lecture.summary}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        )}
      </Box>

      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Bài viết liên quan
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Nội dung liên quan sẽ sớm được cập nhật.
        </Typography>
      </Box>
    </Stack>
  );
}
