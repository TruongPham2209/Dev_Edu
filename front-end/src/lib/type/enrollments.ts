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

export type CheckoutRequest = {
  entityIds: string[];
  entityType: EntityType;
};

export type CheckoutDetailResponse = {
  orderId: string;
  totalAmount: number;
  entityType: string;
  items: CourseItemResponse[];
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

export type PaymentRequest = {
  orderId: string;
  paymentMethod: PaymentMethod;
};

export type PaymentResponse = {
  paymentId: string;
  orderId: string;
  entityType: EntityType;
  paymentUrl: string;
  totalAmount: number;
};
