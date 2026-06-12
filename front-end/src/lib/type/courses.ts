// --- Category ---

export type CategoryResponse = {
  id: string;
  name: string;
  description: string;
  thumbnailObjectKey: string;
  thumbnailUrl: string;
  totalCourses: number;
};

export type CategoryRequest = {
  id?: string | null;
  name: string;
  description: string;
  thumbnailObjectKey: string;
};

// --- Course ---

export type CourseResponse = {
  id: string;
  categoryId: string;

  title: string;
  thumbnailObjectKey: string;
  thumbnailUrl: string | null;
  description: string;
  createdAt: string;

  originalPrice: number | null;
  discountedPercentage: number | null;
  discountedPrice: number | null;
  validTo: string | null;

  registered: boolean;
  avgReview: number;
  totalReview: number;
  totalEnrollment: number;

  lecturers: string[] | null;
};

export type CourseRequest = {
  id?: string | null;
  categoryId: string;
  title: string;
  description: string;
  price: number;
  thumbnailObjectKey: string;
  lecturerUsernames: string[];
};

// --- Review ---

export type ReviewResponse = {
  id: string;
  comment: string;
  rating: number;
  username: string;
  fullName: string;
  avatarUrl: string;
  createdAt: string;
};

export type ReviewRequest = {
  courseId: string;
  content: string;
  rating: number;
};

// --- Course Discount ---

export type CourseDiscountRequest = {
  courseId?: string | null;
  description: string;
  discountPercentage: number;
  validFrom: string;
  validTo: string;
};

export type CourseDiscountResponse = {
  id: string;
  courseId?: string | null;
  originalPrice?: number | null;
  courseTitle?: string | null;
  courseDescription?: string | null;
  courseThumbnailUrl?: string | null;
  discountDescription: string;
  discountPercentage: number;
  validFrom: string;
  validTo: string;
  createdBy: string;
  createdAt: string;
};
