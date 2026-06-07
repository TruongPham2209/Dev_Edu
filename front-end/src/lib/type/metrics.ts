import { MetricPeriod } from "./enum";

export type DashboardOverviewResponse = {
  totalUsers: number;
  totalCourses: number;
  totalLectures: number;
  totalAssignments: number;
  totalEnrollments: number;
  totalRevenue: number;
  courseCompletionRate: number;
};

export type UserGrowthResponse = {
  date: string;
  count: number;
};

export type CourseGrowthResponse = {
  date: string;
  count: number;
};

export type RevenueGrowthResponse = {
  date: string;
  amount: number;
};

export type RecentActivity = {
  username: string;
  action: string;
  details: string;
  createdAt: string;
};

export type ActivityResponse = {
  dailyActiveUsers: number;
  totalRequestLogs: number;
  recentActivities: RecentActivity[];
  actionDistribution: Record<string, number>;
};

export type TopCourseResponse = {
  id: string;
  title: string;
  price: number;
  createdBy: string;
  createdAt: string;
  enrollmentCount: number;
  averageRating: number;
  reviewCount: number;
  totalRevenue: number;
};

export type TopStudent = {
  username: string;
  fullName: string;
  email: string;
  enrollmentCount: number;
  totalSpent: number;
};

export type TopContributor = {
  username: string;
  fullName: string;
  postCount: number;
  commentCount: number;
};

export type TopUsersResponse = {
  topStudents: TopStudent[];
  topContributors: TopContributor[];
};
