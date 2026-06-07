import type {
  ActivityResponse,
  CourseGrowthResponse,
  DashboardOverviewResponse,
  RevenueGrowthResponse,
  TopCourseResponse,
  TopUsersResponse,
  UserGrowthResponse,
} from "@/lib/type/metrics";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { MetricPeriod } from "../type/enum";
import { apiGet } from "./client";

export const metricsApi = {
  getDashboard: async (): Promise<DashboardOverviewResponse> => {
    return apiGet<DashboardOverviewResponse>("/api/metrics/dashboard");
  },

  getUserGrowth: async (params?: {
    period?: MetricPeriod;
  }): Promise<UserGrowthResponse[]> => {
    const query = new URLSearchParams();
    if (params?.period) {
      query.append("period", params.period);
    }
    const qs = query.toString();
    return apiGet<UserGrowthResponse[]>(
      `/api/metrics/users-growth${qs ? "?" + qs : ""}`,
    );
  },

  getCourseGrowth: async (params?: {
    period?: MetricPeriod;
  }): Promise<CourseGrowthResponse[]> => {
    const query = new URLSearchParams();
    if (params?.period) {
      query.append("period", params.period);
    }
    const qs = query.toString();
    return apiGet<CourseGrowthResponse[]>(
      `/api/metrics/courses-growth${qs ? "?" + qs : ""}`,
    );
  },

  getRevenueGrowth: async (params?: {
    period?: MetricPeriod;
  }): Promise<RevenueGrowthResponse[]> => {
    const query = new URLSearchParams();
    if (params?.period) {
      query.append("period", params.period);
    }
    const qs = query.toString();
    return apiGet<RevenueGrowthResponse[]>(
      `/api/metrics/revenue-growth${qs ? "?" + qs : ""}`,
    );
  },

  getActivity: async (params?: {
    days?: number;
  }): Promise<ActivityResponse> => {
    const query = new URLSearchParams();
    if (params?.days !== undefined) {
      query.append("days", String(params.days));
    }
    const qs = query.toString();
    return apiGet<ActivityResponse>(
      `/api/metrics/activity${qs ? "?" + qs : ""}`,
    );
  },

  getTopCourses: async (params?: {
    limit?: number;
  }): Promise<TopCourseResponse[]> => {
    const query = new URLSearchParams();
    if (params?.limit !== undefined) {
      query.append("limit", String(params.limit));
    }
    const qs = query.toString();
    return apiGet<TopCourseResponse[]>(
      `/api/metrics/top-courses${qs ? "?" + qs : ""}`,
    );
  },

  getTopUsers: async (params?: {
    limit?: number;
  }): Promise<TopUsersResponse> => {
    const query = new URLSearchParams();
    if (params?.limit !== undefined) {
      query.append("limit", String(params.limit));
    }
    const qs = query.toString();
    return apiGet<TopUsersResponse>(
      `/api/metrics/top-users${qs ? "?" + qs : ""}`,
    );
  },
};

// --- React Query Hooks ---

export function useDashboardMetrics(
  options?: Omit<
    UseQueryOptions<DashboardOverviewResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["metrics", "dashboard"],
    queryFn: metricsApi.getDashboard,
    ...options,
  });
}

export function useUserGrowth(
  period?: MetricPeriod,
  options?: Omit<
    UseQueryOptions<UserGrowthResponse[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["metrics", "user-growth", period],
    queryFn: () => metricsApi.getUserGrowth({ period }),
    ...options,
  });
}

export function useCourseGrowth(
  period?: MetricPeriod,
  options?: Omit<
    UseQueryOptions<CourseGrowthResponse[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["metrics", "course-growth", period],
    queryFn: () => metricsApi.getCourseGrowth({ period }),
    ...options,
  });
}

export function useRevenueGrowth(
  period?: MetricPeriod,
  options?: Omit<
    UseQueryOptions<RevenueGrowthResponse[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["metrics", "revenue-growth", period],
    queryFn: () => metricsApi.getRevenueGrowth({ period }),
    ...options,
  });
}

export function useActivity(
  days?: number,
  options?: Omit<
    UseQueryOptions<ActivityResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["metrics", "activity", days],
    queryFn: () => metricsApi.getActivity({ days }),
    ...options,
  });
}

export function useTopCourses(
  limit?: number,
  options?: Omit<
    UseQueryOptions<TopCourseResponse[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["metrics", "top-courses", limit],
    queryFn: () => metricsApi.getTopCourses({ limit }),
    ...options,
  });
}

export function useTopUsers(
  limit?: number,
  options?: Omit<
    UseQueryOptions<TopUsersResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ["metrics", "top-users", limit],
    queryFn: () => metricsApi.getTopUsers({ limit }),
    ...options,
  });
}
