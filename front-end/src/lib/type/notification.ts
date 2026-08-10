import {
  NotificationCategory,
  NotificationTargetType,
  NotificationEventType,
  RoleEnum,
} from "./enum";

export type {
  NotificationCategory,
  NotificationTargetType,
  NotificationEventType,
};

export type NotificationResponse = {
  id: string;
  username?: string | null;
  type: NotificationEventType | null;
  title: string;
  content?: string | null;
  targetData?: Record<NotificationTargetType, string> | null;
  isRead?: boolean | null;
  readAt?: string | null;
  createdAt: string;
  category: NotificationCategory;
  createdBy?: string | null;
  targetRoles?: RoleEnum[] | null;
};

export type UnreadCountResponse = {
  personalUnreadCount: number;
  groupUnreadCount: number;
  totalUnreadCount: number;
};

export type CreateGroupNotificationRequest = {
  title: string;
  content?: string | null;
  targetRoles: RoleEnum[];
};
