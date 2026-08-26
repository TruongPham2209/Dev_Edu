import type { PostStatus } from "@/lib/type/enum";

export const POST_STATUS_OPTIONS = [
  { id: "PENDING", title: "Pending" },
  { id: "APPROVED", title: "Approved" },
  { id: "REJECTED", title: "Rejected" },
  { id: "SUPERSEDED", title: "Superseded" },
];

export const getStatusColor = (
  status: PostStatus | string,
): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
  switch (status) {
    case "APPROVED":
      return "success";
    case "PENDING":
      return "warning";
    case "REJECTED":
      return "error";
    case "SUPERSEDED":
      return "default";
    default:
      return "default";
  }
};
