// --- Enrollment / Payment / Cart ---

import { EntityType, PaymentMethod, PaymentStatus } from "./enum";

export type CourseItemDetailResponse = {
  id: string;

  courseId: string;
  title: string;
  description: string;
  thumbnailUrl: string;

  originalPrice?: number;
  discountedPrice: number;

  timestamp: string;
  status?: PaymentStatus;
};

export type PurchaseRequest = {
  entityIds: string[];
  entityType: EntityType;
  paymentMethod: PaymentMethod;
  ipAddress?: string;
};

export type PurchaseDetailResponse = {
  paymentId: string;
  paymentUrl: string | null;
  totalAmount: number;
  entityType: string;
  items: CourseItemResponse[] | null; // TODO: Update if implements subscription
};

export type OrderDetailResponse = {
  id: string;
  totalAmount: number;
  status: PaymentStatus;
  createdAt: string;
  items: CourseItemDetailResponse[];
};

export type CourseItemResponse = {
  id: string;
  registered: boolean;
  originalPrice: number | null;
  discountedPrice: number | null;
  title: string;
  thumbnailUrl: string | null;
};
